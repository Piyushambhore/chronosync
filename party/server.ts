import type * as Party from 'partykit/server';
import { onConnect } from 'y-partykit';

/**
 * ChronoSync PartyKit Server
 *
 * Each "room" is a separate Durable Object instance running on
 * Cloudflare's global edge network (300+ PoPs worldwide).
 *
 * This server handles the full Yjs protocol:
 *  - Initial state sync (sends full Y.Doc state to new connections)
 *  - Incremental update broadcasting (forwards CRDT updates to all peers)
 *  - Awareness protocol (live cursors, tool states, active selections)
 *  - Automatic persistence (saves Y.Doc binary to Durable Object storage)
 *
 * Zero configuration needed — y-partykit handles all Yjs wire protocol details.
 */
export default class YjsRoom implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection) {
    return await onConnect(conn, this.room, {
      // Automatically persist the Y.Doc to Durable Object storage.
      // On reconnect, new peers receive the full document state immediately.
      persist: true,

      // Optional: debounce persistence writes to reduce storage I/O
      // The document is saved at most once per second after any edit.
      callback: {
        debounceWait: 1000,
        debounceMaxWait: 10000,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        handler: async () => {},
      },
    });
  }
}
