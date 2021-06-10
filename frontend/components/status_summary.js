import React from 'react';

export default class StatusSummary extends React.PureComponent {

    render() {
        const { discretizedData  } = this.props;
        const allTime = discretizedData.get(Infinity)[0];
        const byHour = discretizedData.get(60*60*1000);
        const byDay = discretizedData.get(24*60*60*1000);
        const lastHour = byHour[byHour.length - 1];
        const lastDay = byHour[byDay.length - 1];

        const precision = 2;
        
        return (
            <div className="status-summary">
                <h1>All-time: out {allTime.outagePercentage.toFixed(precision)}%, degraded {allTime.degradedPercentage.toFixed(precision)}%</h1>
                <h2>Last day: out {lastDay.outagePercentage.toFixed(precision)}%, degraded {lastDay.degradedPercentage.toFixed(precision)}%</h2>
                <h2>Last hour: out {lastHour.outagePercentage.toFixed(precision)}%, degraded {lastHour.degradedPercentage.toFixed(precision)}%</h2>
            </div>
        );
    }

}
