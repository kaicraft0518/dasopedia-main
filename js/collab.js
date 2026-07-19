// Yjs + Ably によるリアルタイム共同編集モジュール
// TipTapのCollaborationエクステンションと組み合わせて使用する

export async function createCollabProvider(articleId, ablyApiKey, onStatusChange) {
  const [
    { default: Ably },
    Y,
  ] = await Promise.all([
    import('https://esm.sh/ably@2?bundle'),
    import('https://esm.sh/yjs@13?bundle'),
  ]);

  const ydoc = new Y.Doc();
  const channelName = `dasopedia-article-${articleId}`;

  const client = new Ably.Realtime({ key: ablyApiKey });
  const channel = client.channels.get(channelName);

  // 自分のYjs更新をAblyに送信
  ydoc.on('update', (update, origin) => {
    if (origin === 'remote') return; // 受信した更新は再送しない
    let binary = '';
    for (let i = 0; i < update.length; i++) binary += String.fromCharCode(update[i]);
    const base64 = btoa(binary);
    channel.publish('yjs-update', base64);
  });

  // Ablyから受信したYjs更新を適用
  channel.subscribe('yjs-update', (msg) => {
    const binary = atob(msg.data);
    const update = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) update[i] = binary.charCodeAt(i);
    Y.applyUpdate(ydoc, update, 'remote');
  });

  // プレゼンス（誰が編集中か）
  const presenceUsers = new Map();
  function notifyPresence() {
    if (onStatusChange) onStatusChange(Array.from(presenceUsers.values()));
  }

  channel.presence.subscribe('enter', (member) => {
    presenceUsers.set(member.clientId, member.data);
    notifyPresence();
  });
  channel.presence.subscribe('leave', (member) => {
    presenceUsers.delete(member.clientId);
    notifyPresence();
  });
  channel.presence.subscribe('update', (member) => {
    presenceUsers.set(member.clientId, member.data);
    notifyPresence();
  });

  async function enterPresence(uid, displayName) {
    await channel.presence.enter({ uid, displayName });
    const members = await channel.presence.get();
    members.forEach(m => presenceUsers.set(m.clientId, m.data));
    notifyPresence();
  }

  async function leavePresence() {
    try { await channel.presence.leave(); } catch (e) {}
  }

  function destroy() {
    leavePresence();
    channel.unsubscribe();
    client.close();
    ydoc.destroy();
  }

  return { ydoc, client, channel, enterPresence, leavePresence, destroy, Y };
}
