import React from 'react';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import {connect} from 'react-redux';
import uiActions from '../actions/ui-actions';
import { DAYS } from '../config/constants';

class ListData extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            data: [],
            showAll: false,
        }
    }

 

    show = () =>{
        this.props.setLoading(true)
        setImmediate(()=> this.setState({...this.state, showAll: !this.state.showAll}));
        setImmediate(()=> this.props.setLoading(false));
    }

    render  = () =>{
        const {showAll} = this.state;
        const {logs} = this.props;
        const data = Object.keys(this.props.logs);
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
                        <tr>
                            <th>UID</th>
                            <th>Name</th>
                            <th>Date</th>
                            <th>Day of Week</th>
                            <th>Hours</th>
                            <th>Leaves</th>
                            <th>Work from Homes</th>
                            <th>Holidays</th>
                        </tr>
                    </thead>
                    <tbody>
                    {data && data.map((key)=>(
                        <>
                            {this.props.logs[key].entryLog.map((log, i)=>{
                            const date = log ? new Date(log.year, log.month, log.date) : null;
                            const show = log && (!log.hasLog && !log.hasWfh && !log.hasLeave & !log.hasHoliday);
                            if (log && date.getDay() !== 0 && date.getDay() !== 6  && (this.state.showAll || show)){
                                return(
                                    <tr>
                                        <td>{logs[key].uid}</td>
                                        <td>{logs[key].name}</td>
                                        <td>{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                        <td>{DAYS[date.getDay()]}</td>
                                        <td>{log.totalHours}</td>
                                        <td>{log.absence}</td>
                                        <td>{log.wfh}</td>
                                        <td>{log.holiday}</td>
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

const mapStateToProps = state =>{
    return {
        logs: state.entryLog.logs,
    }
}
const mapDispatchToProps = dispatch =>{
    return {
        setLoading: show =>{
            if (show) dispatch (uiActions.showLoading());
            else dispatch(uiActions.hideLoading());
        }
    }

}
export default connect(mapStateToProps, mapDispatchToProps)(ListData);
