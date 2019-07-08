import React from 'react';
import ListData from './list-data';
import papa from 'papaparse';
import constants from '../config/constants';
import Loader from './loader';

const lodash = require('lodash');

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
            loading: false
        }

    }

    load = (event) =>{
        event && event.preventDefault();
        this.setState({loading: true});
        papa.parse(this.state.files.summary, {
            header: true,
            dynamicTyping: true,
            complete: (results, file)=>{                
                const filtered = [];
                results.data.forEach((data,index)=>{
                    
                    const date = new Date(data.Date);
                    const uid = data.UID;

                    if (date.getMonth() !== Number(this.state.month)) return;
                    
                    let item = filtered[uid] 
                    
                    if (!item){
                        filtered[uid] = {uid:data["UID"], name: data["Employee Name"], entryLog: [...this.state.template]};
                        item = filtered[uid];
                    }
                    item.entryLog[date.getDate()] ={...item.entryLog[date.getDate()], totalHours:  data["Hours Worked"], hasLog: data["Hours Worked"] > 0};
                });


                console.log('employees', filtered);
                this.setState({...this.state, data: results.data, employees: filtered}, ()=>{
                    this.setState({loading: false})
                });
            }
        })
    }

    loadLeaves = (event) =>{
        event && event.preventDefault();
        this.setState({loading: true});
        papa.parse(this.state.files.leaves, {
            header: true,
            dynamicTyping: true,
            complete: (results, file)=>{                
                const filtered = [];
                const {employees} = {...this.state};
                results.data.forEach((data,index)=>{
                    const uid = (data["Employee ID"] ? data["Employee ID"] : "");
                    if (employees[uid]){
                        const begin = new Date(data["Begin Date"]);
                        const absence = data["Absence Name"];
                        const end = new Date(data["End Date"]);
                        const date = new Date(data["Begin Date"]);
                        do{
                            employees[uid].entryLog[date.getDate()] = {...employees[uid].entryLog[date.getDate()], absenceType : absence, hasLeave: true};
                            date.setDate(date.getDate()+1);
                        }while (date.getMonth() <= Number(this.state.month) && date.getTime() <= end.getTime());
                    }
                });

                this.setState({...this.state, employees: employees}, ()=>{
                    this.setState({loading: false});
                });
            }
        })
    }


    loadWFH = (event) =>{
        event && event.preventDefault();
        this.setState({loading: true});
        papa.parse(this.state.files.wfh, {
            header: true,
            dynamicTyping: true,
            complete: (results, file) =>{
                const filtered = [];
                const {employees} = {...this.state};
                results.data.forEach((data,index)=>{
                    const uid = (data["Employee ID"] ? data["Employee ID"].toUpperCase() : "");
                    if (employees[uid]){
                        const begin = new Date(data["Begin Date"]);
                        const absence = data["Start Date"];
                        const end = new Date(data["End Date"]);
                        const date = new Date(data["Start Date"]);
                        do{
                            employees[uid].entryLog[date.getDate()] = {...employees[uid].entryLog[date.getDate()], wfh : "Yes", hasWfh: true};
                            date.setDate(date.getDate()+1);
                        }while (date.getMonth() <= Number(this.state.month) && date.getTime() <= end.getTime());
                    }
                });

                this.setState({...this.state, employees: employees}, ()=>{
                    this.setState({loading: false});
                });            
            }
        })
    }

    loadHolidays = (event) =>{
        event && event.preventDefault();
        this.setState({loading: true});
        papa.parse(this.state.files.holidays, {
            header: true,
            dynamicTyping: true,
            complete: (results, file) =>{
                const filtered = [];
                const {employees} = {...this.state};
                results.data.forEach((data, index)=>{
                    const holiday = new Date(data["Holidays"]);
                    console.log('holiday', data);
                    if (holiday && data["Holidays"]){
                        const description = data["Description"] ? data["Description"] : "Holiday";
                        const date = holiday.getDate();
                        
                        employees.forEach(employee =>{
                            
                            if (employees[employee.uid].entryLog[date]){
                                console.log('description', description);
                                employees[employee.uid].entryLog[date].holiday = description;
                                employees[employee.uid].entryLog[date].hasHoliday = description;
                            }

                        });
                    }
                })

                this.setState({...this.state, employees: employees}, ()=>{
                    this.setState({loading: false});
                });            
            }
        })
    }

    handleFile = (event) =>{
        const id = event.currentTarget.id;

        this.setState({...this.state, files: {...this.state.files, [event.currentTarget.id]: event.currentTarget.files[0]}},
        ()=>{
           console.log('testing');
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
            }
        });
    }


    handleSetMonth = (event) =>{
        this.setState({loading: true});

        const {month, year} = this.state;
        const date = new Date(year, month, 1);
        const template = [];
        do{
            template[date.getDate()] = {
                year: date.getFullYear(), 
                month: date.getMonth(), 
                date: date.getDate(), 
                totalHours: 0, 
                absenceType: "", 
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
            this.setState({loading: false});

        });
    }

    render = () =>(
        <div className='row'>
            <Loader loading={this.state.loading} />
            <div className='col-12'>
            <h2>Upload Data: </h2>
            </div>
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

            <div className='col-12'>
                <ListData data={this.state.employees} />
            </div>
        </div>
    );
}

export default UploadData;