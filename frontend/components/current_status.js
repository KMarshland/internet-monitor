import React from 'react';

export default class CurrentStatus extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            currentState: '-',
            lastLatency: null,
        };
    }

    componentDidMount() {
        this.props.statusInterface.on('internet_status', ({internet_status, latency}) => {
            this.setState({
                currentState: internet_status,
                lastLatency: latency
            });
        });
    }

    render() {
        const { currentState, lastLatency } = this.state;

        return (
            <h1 className="text-center">
                Internet status: {currentState} { lastLatency && ` / latency: ${lastLatency.toFixed()}`}
            </h1>
        );
    }

}
