import React from 'react';
import Grapher from '@windborne/grapher/src/grapher.js'

export default class StatusSummaryGraph extends React.PureComponent {

    render() {
        const { discretizedData  } = this.props;
        // const oneHour = discretizedData.get(60*60*1000);
        const fiveMin = discretizedData.get(5*60*1000);

        return (
            <Grapher
                series={[
                    // {
                    //     data: oneHour,
                    //     xKey: 'timestamp',
                    //     name: 'Outage percentage (per hour)',
                    //     yKey: 'outagePercentage',
                    //     expandYWith: [0, 100],
                    //     color: '#cb4b4b'
                    // },
                    // {
                    //     data: oneHour,
                    //     xKey: 'timestamp',
                    //     name: 'Degraded percentage (per hour)',
                    //     yKey: 'degradedPercentage',
                    //     expandYWith: [0, 100],
                    //     color: '#d97801'
                    // },
                    {
                        data: fiveMin,
                        xKey: 'timestamp',
                        name: 'Outage percentage (per 5min)',
                        yKey: 'outagePercentage',
                        expandYWith: [0, 100],
                        color: '#cb4b4b'
                    },
                    {
                        data: fiveMin,
                        xKey: 'timestamp',
                        name: 'Degraded percentage (per 5min)',
                        yKey: 'degradedPercentage',
                        expandYWith: [0, 100],
                        color: '#d97801',
                    }
                ]}
                webgl={true}
            />
        )
    }
}
