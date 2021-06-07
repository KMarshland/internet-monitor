
export default class InternetStatusInterface {

    constructor() {
        this.eventListeners = {};

        this.ws = new WebSocket('ws://localhost:4567');
        this.ws.onmessage = (message) => {
            const data = JSON.parse(message.data);
            this.emit(data.type, data);
        };
    }

    emit(event, data) {
        if (!this.eventListeners[event]) {
            return;
        }

        for (let listener of this.eventListeners[event]) {
            listener(data);
        }
    }

    on(event, listener) {
        this.eventListeners[event] = this.eventListeners[event] || new Set();
        this.eventListeners[event].add(listener);
    }

    off(event, listener) {
        this.eventListeners[event] = this.eventListeners[event] || new Set();
        this.eventListeners[event].add(listener);
    }

    dispose() {
        this.ws.close();
        this.eventListeners = {};
    }
}
