import React from 'react';
import constants from '../config/constants';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
let current = {};


class ListData extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            data: props.data,
            showAll: false,
        }
    }

    componentDidUpdate = (props) =>{
        if (props.data !== this.props.data){
            this.setState({...this.state, data: this.props.data});
        }
    }

    show = () =>{
        this.setState({...this.state, showAll: !this.state.showAll});
    }

    render  = () =>{
        const {data, showAll} = this.state;
        return(
            <div>
                <h3>Employee Entry Logs:</h3>
                <button className='btn' onClick={this.show.bind(this)}>{showAll? "Show missing logs only" : "Show all logs"}</button>
                <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="btn"
                    table="employee-log-table"
                    filename="employeelog"
                    sheet="tablexls"
                    buttonText="Download as XLS"/>

                <table className='table' id='employee-log-table'>
                    <thead className='thead-dark'>
                        <th>UID</th>
                        <th>Name</th>
                        <th>Date</th>
                        {showAll && 
                            <>
                                <th>Hours</th>
                                <th>Leaves</th>
                                <th>Holidays</th>
                                <th>Work from Homes</th>
                            </>
                        }
                    </thead>
                    <tbody>
                    {Object.keys(data).map((key)=>(
                        <>
                            {data[key].entryLog.map((log, i)=>{
                            const date = log ? new Date(log.year, log.month, log.date) : null;
                            const show = log && (!log.hasLog && !log.hasWfh && !log.hasLeave & !log.hasHoliday);
                            if (log && date.getDay() !== 0 && date.getDay() !== 6  && (this.state.showAll || show)){
                                return(
                                    <tr>
                                        <td>{data[key].uid}</td>
                                        <td>{data[key].name}</td>
                                        <td>{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                        {showAll && (
                                            <>
                                                <td>{log.totalHours}</td>
                                                <td>{log.absence}</td>
                                                <td>{log.wfh}</td>
                                                <td>{log.holiday}</td>
                                            </>
                                        )}
                                    </tr>
                                )}
                            else{
                                return null;    
                            }
                            })
                            }
                        </>
                    ))}
                    </tbody>
                </table>
                
            </div>
        );
    }
}

export default ListData;
