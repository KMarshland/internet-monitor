import React from 'react';
import Kefir from 'kefir';
import Grapher from '@windborne/grapher/src/grapher.js'

export default class StatusGraph extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            liveData: Kefir.stream((emitter) => {
                this.props.statusInterface.on('internet_status', ({ internet_status, latency }) => {
                    if (internet_status === 'offline') {
                        emitter.emit({
                            timestamp: new Date(),
                            latency: null
                        });
                    } else {
                        emitter.emit({
                            timestamp: new Date(),
                            latency
                        });
                    }
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
                        expandYWith: [0]
                    }
                ]}
                webgl={true}
            />
        )
    }
}
