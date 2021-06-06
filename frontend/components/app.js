import React from 'react';
import Grapher from '@windborne/grapher'

export default class App extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            currentState: 'working'
        };
    }


    render() {
        const { currentState } = this.state;

        return (
            <div>
                <h1 className="text-center">
                    Internet status: {currentState}
                </h1>

                <Grapher
                    series={[]}
                />
            </div>
        )
    }

}
