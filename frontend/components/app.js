import React from 'react';
import InternetStatusInterface from '../state/internet_status_interface.js';
import StatusGraph from './status_graph.js';

export default class App extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            currentState: '-',
            lastLatency: null
        };

        this.statusInterface = new InternetStatusInterface();
    }

    componentDidMount() {
        this.statusInterface.on('internet_status', ({ internet_status, latency }) => {
            this.setState({ currentState: internet_status, lastLatency: latency });
        });
    }

    componentWillUnmount() {
        this.statusInterface.dispose();
    }

    render() {
        const { currentState, lastLatency } = this.state;

        return (
            <div>
                <h1 className="text-center">
                    Internet status: {currentState} { lastLatency && ` / latency: ${lastLatency.toFixed()}`}
                </h1>

                <StatusGraph
                    statusInterface={this.statusInterface}
                />
            </div>
        )
    }

}
