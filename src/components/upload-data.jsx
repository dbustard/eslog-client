import React from 'react';
import papa from 'papaparse';
import constants from '../config/constants';
import {connect} from 'react-redux';
import actions from '../actions/entry-log-actions';
import uiActions from '../actions/ui-actions';
import lodash from 'lodash';
import { LOG, WFH, ABSENCE, HOLIDAY } from '../config/field-mapping'
import hasProperties from '../utils/has-properties';

class UploadData extends React.Component{
    constructor (props){
        super(props);
        const date = new Date();
        this.state = {
            files: {
                summary: {},
                leaves: {},
                wfh: {},
                holidays: {}
            },
            data: [],
            leaveRecords: [],
            employees: {},
            year: date.getFullYear(),
            month: date.getMonth(),
            template: [],
            hasLog: false,
            hasLeave: false,
            hasWfh: false,
            hasHoliday: false,
        }

    }

    load = (event) =>{
        event && event.preventDefault();

        this.props.clearError();

        this.props.setLoading(true);

        papa.parse(this.state.files.summary, {
            header: true,
            dynamicTyping: true,
            complete: (results, file)=>{
                const logs = {};
               const isValid = results.data.every((data,index)=>{
                    const uid = data[LOG.UID];
                    const date = new Date(data[LOG.DATE]);
                    const name = data[LOG.EMPLOYEE_NAME];
                    const hoursWorked = data[LOG.HOURS_WORKED];
                    const day = date.getDate();

                    if (index === 0 && !hasProperties(data, LOG))
                    {
                        return false;
                    }

                    if (date.getMonth() !== Number(this.state.month)) return true;
                
                    let item = logs[uid] 
                    
                    if (!item){
                        logs[uid] = {uid:uid, name: name, entryLog: [...this.state.template]};
                        item = logs[uid];
                    }

                    item.entryLog[day] ={...item.entryLog[day], totalHours: hoursWorked, hasLog: hoursWorked > 0};
                    return true;
                });

                if (!isValid){
                    this.props.setError("Invalid log data");
                }else{
                    this.props.setLogs(logs);
                }
                this.props.setLoading(false);
            }
        })
    }

    loadLeaves = (event) =>{
        event && event.preventDefault();
        this.props.clearError();
        this.props.setLoading(true);

        papa.parse(this.state.files.leaves, {
            header: true,
            dynamicTyping: true,
            complete: (results, file)=>{   
                const logs = lodash.cloneDeep(this.props.logs)
                const isValid = results.data.every((data,index)=>{
                    const uid = (data[ABSENCE.UID] ? data[ABSENCE.UID] : "");       

                    if (index === 0 && !hasProperties(data, ABSENCE)) return false;
                    if (logs[uid]){
                        const absence = data[ABSENCE.TYPE];
                        const end = new Date(data[ABSENCE.END_DATE]);
                        const date = new Date(data[ABSENCE.BEGIN_DATE]);
                        do{
                            const curr = date.getDate();
                            logs[uid].entryLog[curr] = {...logs[uid].entryLog[curr], absence : absence, hasLeave: true};
                            date.setDate(date.getDate()+1);
                        }while (date.getMonth() <= Number(this.state.month) && date.getTime() <= end.getTime());
                    }
                    return true;
                });

                if (isValid){
                    this.props.setLogs(logs);
                }else{
                    this.props.setError("Invalid leaves file");
                }

                this.props.setLoading(false);

            }
        })
    }

    loadWFH = (event) =>{
        this.props.clearError();
        event && event.preventDefault();
        this.props.setLoading(true);
        papa.parse(this.state.files.wfh, {
            header: true,
            dynamicTyping: true,
            complete: (results, file) =>{
                const logs = lodash.cloneDeep(this.props.logs)

                const isValid = results.data.every((data, index)=>{
                    const uid = (data[WFH.UID] ? data[WFH.UID].toUpperCase() : "");
                    const end = new Date(data[WFH.END_DATE]);
                    const date = new Date(data[WFH.START_DATE]);
                               
                    if (index === 0 && !hasProperties(data, WFH)) return false;

                    do{
                        const curr = date.getDate();
                        if (logs[uid]){
                            logs[uid].entryLog[curr] = {...logs[uid].entryLog[curr], wfh : "Yes", hasWfh: true};
                        }
                        date.setDate(date.getDate()+1);
                    }while (date.getMonth() <= Number(this.state.month) && date.getTime() <= end.getTime());

                    return true;
                });

                if (isValid){
                    this.props.setLogs(logs);
                }else{
                    this.props.setError("invalid wfh file");
                }

                this.props.setLoading(false);
            }
        })
    }

    loadHolidays = (event) =>{
        event && event.preventDefault();
        this.props.clearError();
        this.props.setLoading(true);
        papa.parse(this.state.files.holidays, {
            header: true,
            dynamicTyping: true,
            complete: (results) =>{

                const logs = lodash.cloneDeep(this.props.logs)
                const isValid = results.data.every((data, index)=>{

                    if (index === 0 && hasProperties(data, HOLIDAY)) return false;
                    const holiday = new Date(data[HOLIDAY.HOLIDAY]);

                    if (holiday && data[HOLIDAY.HOLIDAY]){
                        const description = data[HOLIDAY.DESCRIPTION] ? data[HOLIDAY.DESCRIPTION] : "Holiday";
                        const date = holiday.getDate();
                        
                        logs.forEach(emp =>{
                            
                            if (logs[emp.uid].entryLog[date]){
                                logs[emp.uid].entryLog[date].holiday = description;
                                logs[emp.uid].entryLog[date].hasHoliday = !!description;
                            }

                        });
                    }

                    return true;
                })

                
                if (isValid){
                    this.props.setLogs(logs);
                }else{
                    this.props.setError("Invalid leaves file");
                }

                this.props.setLoading(false);
                           }
        })
    }
    
    handleFile = (event) =>{
        const id = event.currentTarget.id;

        this.setState({...this.state, files: {...this.state.files, [event.currentTarget.id]: event.currentTarget.files[0]}},
        ()=>{
            switch(id){
                case 'summary':
                    this.load();
                    return;
                case 'leaves':
                    this.loadLeaves();
                    return;
                case 'wfh':
                    this.loadWFH();
                    return;
                case 'holidays':
                    this.loadHolidays();
                    return;
                default:
                    return;
            }
        });
    }


    handleSetMonth = (event) =>{
        this.props.setLoading(true);

        const {month, year} = this.state;
        const date = new Date(year, month, 1);
        const template = [];
        do{
            template[date.getDate()] = {
                year: date.getFullYear(), 
                month: date.getMonth(), 
                date: date.getDate(), 
                totalHours: 0, 
                absence: "", 
                wfh: "", 
                holiday: "",
                hasLog: false,
                hasLeave: false,
                hasWfh: false,
                hasHoliday: false,
                isMonthSet: false
            };           
            date.setDate(date.getDate()+1);
        } while (date.getMonth() === Number(month))

        this.setState({...this.state, template: template, isMonthSet: true}, ()=>{
            this.props.setLoading(false);
        });

        this.props.setTemplate(template);
    }

    render = () =>(
        <div className='row'>
            <div className='col-12'>
            <h2>Upload Data: </h2>
            </div>
            {this.props.error &&
                <div className='col-12 alert alert-warning'>{this.props.error}</div>
            }
            {!this.state.isMonthSet &&
                <div className='col-12'>
                    <div>
                        <label>Set month and year:</label>
                    </div>
                    <div>
                        <select id="month" value={this.state.month} onChange={e=>this.setState({...this.state, month: e.target.value })}>
                            {constants.MONTHS.map((month, index)=>
                                <option value={index} key={index}>{month}</option>
                            )}
                        </select>

                        <input type='number' placeholder='year' value={this.state.year} onChange={e=>this.setState(this.setState({...this.state, year: e.value}))} />
                        <button onClick={this.handleSetMonth.bind(this)}>set month</button>
                    </div>
                </div>
            }
            <div className='col-6'>
                <div>
                    <label>Select enty log file:</label>
                </div>
                <div>
                    <input type='file' id='summary'  onChange={this.handleFile.bind(this)} disabled={!this.state.isMonthSet} />
                </div>
            </div>

            <div className='col-6'>
                <div>
                    <label>Select filed leaves file:</label>
                </div>
                <div>
                    <input type='file' id='leaves'  onChange={this.handleFile.bind(this)} disabled={!this.state.isMonthSet} />
                </div>
            </div>

            <div className='col-6'>
                <div>
                    <label>Select Work from home file:</label>
                </div>
                <div>
                    <input type='file' id='wfh'  onChange={this.handleFile.bind(this)} disabled={!this.state.isMonthSet} />
                </div>
            </div>

            <div className='col-6'>

                <div>
                    <label>Select holidays file:</label>
                </div>
                <div>
                    <input type='file' id='holidays'  onChange={this.handleFile.bind(this)} disabled={!this.state.isMonthSet} />
                </div>
            
            </div>
        </div>
    );
}

const mapStateToProps = state =>{
   return {
       template: state.entryLog.template,
       logs: state.entryLog.logs,
       error: state.entryLog.error
   }
};
const mapDispatchToProps = dispatch =>{
    return{
        setTemplate : template =>{
            dispatch(actions.receiveTemplate(template));
        },

        setLogs: logs =>{
            dispatch(actions.receiveLog(logs));
        },
        
        setError: error =>{
            dispatch(actions.setError(error));
        },

        clearError: error =>{
            dispatch(actions.clearError());
        },

        setLoading: show =>{
            if (show){
                dispatch(uiActions.showLoading());
            }else{
                dispatch(uiActions.hideLoading());
            }
        }
    }

}

export default connect(mapStateToProps, mapDispatchToProps) (UploadData);