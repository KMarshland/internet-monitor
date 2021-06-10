import React from 'react';
import InternetStatusInterface from '../state/internet_status_interface.js';
import StatusGraph from './status_graph.js';
import StatusSummary from './status_summary.js';
import CurrentStatus from './current_status.js';
import StatusSummaryGraph from './status_summary_graph.js';

export default class App extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            currentState: '-',
            lastLatency: null,
            discretizedData: null
        };

        this.statusInterface = new InternetStatusInterface();
    }

    componentDidMount() {
        this.statusInterface.on('internet_status', ({ internet_status, latency }) => {
            this.setState({ currentState: internet_status, lastLatency: latency });
        });

        this.statusInterface.getDiscretizedData().then((discretizedData) => this.setState({ discretizedData }));
    }

    componentWillUnmount() {
        this.statusInterface.dispose();
    }

    render() {
        const { discretizedData } = this.state;

        return (
            <div>
                <CurrentStatus
                    statusInterface={this.statusInterface}
                />

                <StatusGraph
                    statusInterface={this.statusInterface}
                />

                {
                    discretizedData &&
                    <StatusSummary discretizedData={discretizedData} />
                }

                {
                    discretizedData &&
                    <StatusSummaryGraph discretizedData={discretizedData} />
                }
            </div>
        )
    }

}
