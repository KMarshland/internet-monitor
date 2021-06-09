import React from 'react';
import Kefir from 'kefir';
import Grapher from '@windborne/grapher/src/grapher.js'

export default class StatusGraph extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            liveData: Kefir.stream(async (emitter) => {
                await this.props.statusInterface.emitHistoricalStatus(emitter.emit);

                this.props.statusInterface.on('internet_status', ({ internet_status, latency }) => {
                    if (internet_status === 'offline') {
                        latency = null;
                    }

                    emitter.emit({
                        timestamp: new Date(),
                        latency
                    });
                });
            })
        }
    }

    render() {
        const { liveData } = this.state;

        return (
            <Grapher
                series={[
                    {
                        data: liveData,
                        xKey: 'timestamp',
                        yKey: 'latency',
                        expandYWith: [0],
                        background: {
                            null: 'rgba(255, 0, 0, 0.4)',
                            '>= 100': 'rgba(201, 111, 15, 0.4)',
                        }
                    }
                ]}
                webgl={true}
            />
        )
    }
}
