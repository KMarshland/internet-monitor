
export default class InternetStatusInterface {

    constructor() {
        this.eventListeners = {};

        this.createWS();
        this.historicalDataPromise = this.fetchHistoricalStatus();
    }

    createWS() {
        this.ws = new WebSocket(`ws://${window.location.host}`);
        this.ws.onmessage = (message) => {
            const data = JSON.parse(message.data);
            this.emit(data.type, data);
        };

        this.ws.onclose = () => {
            setTimeout(() => {
                this.createWS();
            }, Math.random() * 100);
        }
    }

    async fetchHistoricalStatus() {
        const [index, data] = await Promise.all([
            fetch('/historical-data-index').then((response) => response.arrayBuffer()),
            fetch('/historical-data').then((response) => response.arrayBuffer())
        ]);

        this.historicalDataIndex = new DataView(index);
        this.historicalData = new DataView(data);
    }

    async emitHistoricalStatus(emit) {
        await this.historicalDataPromise;
        let dataI = 0;
        let indexI = 0;

        while (indexI < this.historicalDataIndex.byteLength) {
            const indexTimestamp = this.historicalDataIndex.getFloat64(indexI, true);
            indexI += 8;

            const indexOffset = this.historicalDataIndex.getUint32(indexI, true);
            indexI += 4;

            emit({ timestamp: new Date(indexTimestamp * 1000), latency: null });

            while (dataI < indexOffset || (indexI === this.historicalDataIndex.byteLength && dataI < 8*Math.floor(this.historicalData.byteLength/8))) {
                const timestamp = new Date(this.historicalData.getFloat64(dataI, true) * 1000);
                dataI += 8;

                const latency = this.historicalData.getFloat32(dataI, true);
                dataI += 4;

                if (latency < 0) {
                    emit({ timestamp, latency: null });
                } else {
                    emit({ timestamp, latency });
                }
            }
        }
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
