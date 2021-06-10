
export default class InternetStatusInterface {

    constructor() {
        window.internetStatusInterface = this;

        this.eventListeners = {};

        this.createWS();
        this.historicalDataPromise = this.fetchHistoricalStatus();
    }

    createWS() {
        if (this.ws) {
            this.ws.close();
        }

        this.ws = new WebSocket(`ws://${window.location.host}`);
        this.ws.onmessage = (message) => {
            const data = JSON.parse(message.data);
            this.emit(data.type, data);

            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = setTimeout(() => {
                this.createWS();
            }, 10*1000);
        };

        this.ws.onclose = () => {
            setTimeout(() => {
                this.ws = null;
                this.createWS();
            }, Math.random() * 100);
        }
    }

    async fetchHistoricalStatus() {
        let host = '';
        if (window.location.host === 'localhost:8080') {
            host = 'http://localhost:4567';
        }

        const [index, data] = await Promise.all([
            fetch(host + '/historical-data-index').then((response) => response.arrayBuffer()),
            fetch(host + '/historical-data').then((response) => response.arrayBuffer())
        ]);

        this.historicalDataIndex = new DataView(index);
        this.historicalData = new DataView(data);
    }

    async emitHistoricalStatus(emit) {
        await this.historicalDataPromise;
        let dataI = 0;
        let indexI = 0;

        while (indexI < this.historicalDataIndex.byteLength) {
            // const indexTimestamp = this.historicalDataIndex.getFloat64(indexI, true);
            indexI += 8;

            const indexOffset = this.historicalDataIndex.getUint32(indexI, true);
            indexI += 4;

            // emit({ timestamp: new Date(indexTimestamp * 1000), latency: null, restart: true });

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

    async getDiscretizedData() {
        const discretizationIntervals = [5*60*1000, 60*60*1000, 24*60*60*1000, Infinity];
        const currentChunks = new Map();
        const chunkLists = new Map();
        for (let interval of discretizationIntervals) {
            chunkLists.set(interval, []);
        }

        let lastTimestamp;
        await this.emitHistoricalStatus(({ latency, timestamp, restart }) => {
            if (restart) {
                lastTimestamp = timestamp;
                return;
            }

            for (let interval of discretizationIntervals) {
                let currentChunk = currentChunks.get(interval);
                if (!currentChunk) {
                    currentChunk = {
                        samples: 0,
                        sampleDuration: 0,
                        outageCount: 0,
                        outageDuration: 0,
                        degradedCount: 0,
                        degradedDuration: 0,
                        timestamp
                    };
                    currentChunks.set(interval, currentChunk);
                }

                const duration = lastTimestamp ? timestamp.valueOf() - lastTimestamp.valueOf() : 0;
                if (duration < 0) {
                    console.warn('Negative duration');
                    continue;
                }

                currentChunk.samples++;
                currentChunk.sampleDuration += duration;

                if (latency === null) {
                    currentChunk.outageCount++;
                    currentChunk.outageDuration += duration;
                } else if (latency >= 100) {
                    currentChunk.degradedCount++;
                    currentChunk.degradedDuration += duration;
                }

                if (timestamp - currentChunk.timestamp.valueOf() >= interval) {
                    currentChunk.outagePercentage = 100*currentChunk.outageDuration/currentChunk.sampleDuration;
                    currentChunk.degradedPercentage = 100*(currentChunk.outageDuration + currentChunk.degradedDuration)/currentChunk.sampleDuration;

                    chunkLists.get(interval).push(currentChunk);
                    currentChunks.set(interval, null);
                }
            }

            lastTimestamp = timestamp;
        });

        for (let interval of discretizationIntervals) {
            const currentChunk = currentChunks.get(interval);
            if (currentChunk) {
                currentChunk.outagePercentage = 100*currentChunk.outageDuration/currentChunk.sampleDuration;
                currentChunk.degradedPercentage = 100*(currentChunk.outageDuration + currentChunk.degradedDuration)/currentChunk.sampleDuration;
                chunkLists.get(interval).push(currentChunk);
            }
        }

        this.chunkLists = chunkLists;

        return chunkLists;
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
