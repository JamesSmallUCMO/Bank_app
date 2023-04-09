import React, { useEffect, useState } from 'react';
import { Event, ExpandLess, ExpandMore } from "@mui/icons-material"
import { Button, FormControl } from 'react-bootstrap';
import { StatementService } from '../../services/StatementService';
import { dateStringToDate } from '../../services/utils';

const style = {
    balanceComparisonContainer: {
        marginTop: 48,
        textAlign: "center",
        width: "100%",
        now: {
            fontWeight: "bold",
            textTransform: "uppercase"
        }
    },
    balanceComparisonContent: {
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        width: "100%",
        left: {
            textAlign: "left",
            marginRight: 8
        },
        right: {
            textAlign: "right"
        },
        heading: {
            fontSize: 14,
            marginBottom: 8
        }
    },
    balanceDiffText: {
        textTransform: "uppercase", 
        fontSize: 14, 
        fontWeight: "bold",
        textAlign: "center"
    },
    balanceSavingsMonthControlContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginRight: 32,
        width: 250
    },
    calendarDataContainer: {
        display: "flex",
        margin: 12
    },
    calendarMargin: {
        height: 16
    },
    day: {
        height: 90,
        verticalAlign: "top",
        textAlign: "right",
        padding: 3,
        fontSize: 14,
        overflow: "hidden"
    },
    dayContent: {
        display: "flex",
        flexDirection: "column", 
        height: "100%",
        number: {
            margin: "3px 5px"
        }
    },
    dayOfWeek: {
        width: 115,
        borderWidth: "1px 0",
        marginRight: -1,
        fontWeight: "bold",
        padding: "2px 16px",
        textAlign: "center",
        fontSize: 15
    },
    dayOfWeekRow: {
        border: "1px solid #ccc"
    },
    dayStatement: {
        display: "flex",
        width: "100%",
        marginBottom: 2,
        event: {
            color: "#fff",
            fontSize: 18, 
            margin: "2px 1px"
        }
    },
    dayStatementContent: {
        textAlign: "right",
        flex: 1,
        textContainer: {
            position: "relative",
            width: "100%",
            height: 14
        },
        text: {
            position: "absolute",
            right: 0,
            width: "100%",
            fontSize: 12,
            color: "#fff",
            padding: "0px 4px",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            margin: 0
        }
    },
    dayStatementsContainer: {
        overflow: "hidden"
    },
    iconButton: {
        fontSize: 32,
        color: "#777"
    },
    monthControlContainer: {
        flexShrink: 0,
        textAlign: "center",
        marginBottom: 32
    },
    monthYearInfo: {
        margin: "16px 0",
        month: {
            margin: 0, 
            fontWeight: "900",
        textTransform: "uppercase"
        },
        year: {
            margin: 0
        }
    },
    savingsGoalContainer: {
        width: "100%",
        heading: {
            textAlign: "center",
            marginBottom: 4
        },
        actions: {
            width: "100%",
            textAlign: "center",
            marginTop: 8
        }
    },
    savingsGoalInfoContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center", 
        border: "1px solid #ced4da",
        borderRadius: 5, 
        padding: "0 8px",
        margin: "0 4px"
    },
    savingsGoalInput: {
        border: "none", 
        padding: 0, 
        fontSize: 30, 
        minHeight: 0, 
        height: 40, 
        textAlign: "right",
        boxShadow: "none",
        flex: 1
    },
    savingsGoalText: {
        fontWeight: "bold",
        fontSize: 30,
        margin: 0,
        flex: 1,
        textAlign: "right"
    },
    today: {
        fontWeight: "bold",
        color: "#0d6efd"
    }
}


const Day = ({day, month, statements, year}) => {
    const date = new Date(year, month, day);
    const now = new Date();

    const maxDay = new Date(year, month + 1, 0).getDate();
    const visible = day <= maxDay && day > 0;
    const today = visible && date.toDateString() === now.toDateString();
    const past = date.setHours(0, 0, 0, 0) < now.setHours(0, 0, 0, 0);

    // Only show the statements that occured on this day
    const stmts = statements.filter(s => s.date.toDateString() === date.toDateString())

    return (
        <td
            style={{
                ...style.day, 
                border: visible ? "1px solid #ccc" : "", 
                visibility: !visible ? "hidden" : "visible",
            }}
        >
            <div role="button" style={style.dayContent}>
                <span
                    style={{
                        ...style.dayContent.number,
                        color: today ? "#0d6efd" : "", 
                        fontWeight: today ? "bold" : "normal",
                        opacity: past ? 0.5 : 1
                    }}
                >
                    {visible ? day : ""}
                </span>
                <div style={style.dayStatementsContainer}>
                    {stmts.map((s, idx) => (
                        <div
                            key={idx}
                            style={{
                                ...style.dayStatement,
                                backgroundColor: s.amount < 0 ? "#f00" : "#0b0"
                            }}
                        >
                            {s.planned && <Event style={style.dayStatement.event} />}
                            <div style={style.dayStatementContent}>
                                <div style={style.dayStatementContent.textContainer}>
                                    <p style={style.dayStatementContent.text}>{s.name}</p>
                                </div>
                                <div style={{...style.dayStatementContent.textContainer, height: 18}}>
                                    <p style={{...style.dayStatementContent.text, fontWeight: "bold"}}>
                                        {s.amount.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </td>
    )
}


function MonthlyCalendar() {
    const now = new Date(); // Get current date

    const [month, setMonth] = useState(now.getMonth()); // Start with current month
    const [year, setYear] = useState(now.getFullYear()); // Start with current year

    const [editSavingsGoal, setEditSavingsGoal] = useState(false);
    const [monthlySavingsGoalText, setMonthlySavingsGoalText] = useState("");
    const [monthlySavingsGoal, setMonthlySavingsGoal] = useState(0);
    const [statements, setStatements] = useState([]);

    // Placeholder data
    const [savingsGoals, setSavingsGoals] = useState([
        {month: 2, year: 2023, goal: 300},
        {month: 3, year: 2023, goal: 500},
        {month: 4, year: 2023, goal: 300},
        {month: 5, year: 2023, goal: 700},
        {month: 7, year: 2023, goal: 600},
        {month: 8, year: 2023, goal: 90},
        {month: 11, year: 2023, goal: 100},
        {month: 1, year: 2024, goal: 250},
        {month: 2, year: 2024, goal: 375}
    ]);

    const past = year < now.getFullYear() || (month < now.getMonth() && year === now.getFullYear());

    useEffect(() => {
        StatementService.getAllStatement().then(result =>{
            setStatements(result.map(statement => ({
                ...statement,
                amount: parseFloat(statement.amount), 
                date: dateStringToDate(statement.date)
            })));
        });
    }, []);

    // When the month or year changes, show the corresponding monthly savings goal
    useEffect(() => {
        const savingsGoal = savingsGoals.find(sg => sg.month === month && sg.year === year);

        if (savingsGoal) {
            setMonthlySavingsGoal(savingsGoal.goal);
            setMonthlySavingsGoalText(savingsGoal.goal.toFixed(2));
        } else {
            setMonthlySavingsGoal(0);
            setMonthlySavingsGoalText("");
        }
    }, [month, year])

    useEffect(() => {
        const savingsGoal = savingsGoals.find(sg => sg.month === month && sg.year === year);
        const balance = 500;

        localStorage.setItem("monthlyGoal", savingsGoal.goal);
        localStorage.setItem("monthlyBalance", balance);
    }, [])

    const getMonthName = (m) => { // Months in JS are zero-indexed (why?!?!!)
        const monthNames = [
            "January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"
        ]

        return monthNames[m];
    }

    const getNextMonth = () => {
        const newMonth = (month + 1) % 12;

        setMonth(newMonth);
        if (newMonth === 0)
            setYear(year + 1);
    }

    const getPrevMonth = () => {
        const newMonth = (month - 1) % 12;

        if (newMonth === -1) {
            setMonth(11);
            setYear(year - 1);
        } else {
            setMonth(newMonth);
        }
    }

    // Calculate the target balance for the current day
    const getTargetBalance = () => {
        let startingBalance = 0;
        const statementsBeforeFirst = statements.filter(statement => statement.date < new Date(now.getFullYear(), now.getMonth(), 1));

        for (const statement of statementsBeforeFirst)
            startingBalance += statement.amount;

        const currentMonthlySavingsGoal = savingsGoals.find(sg => 
            sg.month === now.getMonth() && sg.year === now.getFullYear());

        const day = now.getDate();
        const numDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        return startingBalance + (day / numDays) * (currentMonthlySavingsGoal?.goal || 0);
    }

    const getBalance = () => {
        let balance = 0;

        for (let i = 0; i < statements.length; i++)
            balance += statements[i].amount;

        localStorage.setItem("monthlyBalance", balance);
        return balance;
    }

    const save = () => {
        const newMonthlySavingsGoal = parseFloat(monthlySavingsGoalText);

        if (!isNaN(newMonthlySavingsGoal) && isFinite(newMonthlySavingsGoal)) {
            setMonthlySavingsGoal(newMonthlySavingsGoal);

            const goals = savingsGoals.slice();
            const idx = goals.findIndex(sg => sg.month === month && sg.year === year);

            if (idx > -1)
                goals[idx] = {...goals[idx], goal: newMonthlySavingsGoal};
            else
                goals.push({month, year, goal: newMonthlySavingsGoal});

            setSavingsGoals(goals);
            localStorage.setItem("monthlyGoal", JSON.stringify(goals[idx].goal));
        }

        setEditSavingsGoal(false);
    }

    // Get the day idx for the first day of the month. Useful for offseting the calendar
    const startDayOfWeek = new Date(year, month, 1).getDay();
    const monthName = getMonthName(month);

    const edit = editSavingsGoal && !past;
    const targetBalance = getTargetBalance();
    const balance = getBalance();
    const balanceDiff = balance - targetBalance;

    return (
        <div>
            <div style={style.calendarDataContainer}>
                <div style={style.balanceSavingsMonthControlContainer}>
                    <div style={style.monthControlContainer}>
                        <ExpandLess onClick={getPrevMonth} role="button" style={style.iconButton} />
                        <div style={style.monthYearInfo}>
                            <h5 style={style.monthYearInfo.year}>{year}</h5>
                            <h2 style={style.monthYearInfo.month}>{monthName}</h2>
                        </div>
                        <ExpandMore onClick={getNextMonth} role="button" style={style.iconButton} />
                    </div>
                    <div style={style.savingsGoalContainer}>
                        <h6 style={style.savingsGoalContainer.heading}>Monthly Savings Goal</h6>
                        <div>
                            <div
                                style={{
                                    ...style.savingsGoalInfoContainer,
                                    borderColor: edit ? "#ced4da" : "#0000", 
                                }}
                            >
                                <span style={{fontSize: 30, color: edit ? "#6c757d" : "#000"}}>$</span>
                                {edit ? (
                                    <FormControl
                                        onChange={e => setMonthlySavingsGoalText(e.target.value)}
                                        placeholder="0.00" 
                                        size="lg" 
                                        style={{
                                            ...style.savingsGoalInput,
                                            fontWeight: edit ? "normal" : "bold"
                                        }}
                                        value={monthlySavingsGoalText}
                                    />
                                ) : (
                                    <p style={style.savingsGoalText}>
                                        {monthlySavingsGoal.toFixed(2)}
                                    </p>
                                )}
                            </div>
                            <div
                                style={{
                                    ...style.savingsGoalContainer.actions,
                                    visibility: past ? "hidden" : "visible"
                                }}
                            >
                                {edit ? (
                                    <>
                                        <Button
                                            onClick={() => setEditSavingsGoal(false)}
                                            size="sm" 
                                            style={{marginRight: 8}} 
                                            variant="outline-secondary"
                                        >
                                            Cancel
                                        </Button>
                                        <Button onClick={save} size="sm">Save</Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => setEditSavingsGoal(true)} 
                                        size="sm"
                                        variant="outline-primary"
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div style={style.balanceComparisonContainer}>
                        <h6 style={style.balanceComparisonContainer.now}>
                            Today: {getMonthName(now.getMonth())} {now.getDate()}, {now.getFullYear()}
                        </h6>
                        <div style={style.balanceComparisonContent}>
                            <div style={style.balanceComparisonContent.left}>
                                <p style={style.balanceComparisonContent.heading}>Target Balance</p>
                                <h5>${targetBalance.toFixed(2)}</h5>
                            </div>
                            <div style={style.balanceComparisonContent.right}>
                                <p style={style.balanceComparisonContent.heading}>Actual Balance</p>
                                <h5>${balance.toFixed(2)}</h5>
                            </div>
                        </div>
                        <p style={{...style.balanceDiffText, color: balanceDiff >= 0 ? "#0b0" : "#f70"}}>
                            {balanceDiff >= 0 ? "Exceeding" : "Below"} Budget by ${Math.abs(balanceDiff).toFixed(2)}
                        </p>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr style={style.dayOfWeekRow}>
                            <th style={style.dayOfWeek}>Sun</th>
                            <th style={style.dayOfWeek}>Mon</th>
                            <th style={style.dayOfWeek}>Tue</th>
                            <th style={style.dayOfWeek}>Wed</th>
                            <th style={style.dayOfWeek}>Thu</th>
                            <th style={style.dayOfWeek}>Fri</th>
                            <th style={style.dayOfWeek}>Sat</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={style.calendarMargin}>
                            <td colSpan={7}></td>
                        </tr>
                        {Array.from({length: 6}, (_, i) => (
                            <tr key={i}>
                                {Array.from({length: 7}, (_, j) => (
                                    <Day
                                        day={i * 7 + j + 1 - startDayOfWeek}
                                        key={j}
                                        month={month} 
                                        statements={statements}
                                        year={year}
                                    />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>    
            </div>
        </div>
    );
}

export default MonthlyCalendar;