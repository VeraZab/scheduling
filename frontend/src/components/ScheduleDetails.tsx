import { days } from "../constants/schedule";

interface ScheduleDisplayProps {
  schedule: any;
  nurses: unknown;
}

const indexToDayMap = {
  0: "Monday",
  1: "Monday",
  2: "Tuesday",
  3: "Tuesday",
  4: "Wednesday",
  5: "Wednesday",
  6: "Thursday",
  7: "Thursday",
  8: "Friday",
  9: "Friday",
  10: "Saturday",
  11: "Saturday",
  12: "Sunday",
  13: "Sunday",
};

const ScheduleDetails: React.FC<ScheduleDisplayProps> = ({
  schedule,
  nurses,
  requirements,
}) => {
  if (!schedule) {
    return <div>Loading...</div>;
  }

  const scheduleByNurse = schedule.shifts.reduce((acc, curr, index) => {
    const currentShiftIndex = Object.values(indexToDayMap).findIndex(
      (v) => v === curr.dayOfWeek
    );
    const adjustedShiftIndex =
      curr.type === "day" ? currentShiftIndex : currentShiftIndex + 1;

    if (!acc[curr.nurse.id]) {
      acc[curr.nurse.id] = new Array(days.length * 2).fill(0);
    }
    // 1 will indicate nurse was assigned to shift and 0 that they're not
    acc[curr.nurse.id][adjustedShiftIndex] = 1;
    return acc;
  }, {});

  const easyReadRequirements = requirements.reduce((acc, curr) => {
    if (!acc[curr.dayOfWeek]) {
      acc[curr.dayOfWeek] = { day: 0, night: 0 };
    }
    acc[curr.dayOfWeek][curr.shift] = curr.nursesRequired;
    return acc;
  }, {});

  const easyReadNursesAssigned = schedule.shifts.reduce((acc, curr) => {
    if (!acc[curr.dayOfWeek]) {
      acc[curr.dayOfWeek] = { day: 0, night: 0 };
    }
    acc[curr.dayOfWeek][curr.type] += 1;
    return acc;
  }, {});

  return (
    <div className="scheduleTableContainer">
      <table>
        <thead>
          <tr>
            <th>{""}</th>
            {days.map((day) => (
              <th key={day} colSpan={2} style={{ textAlign: "center" }}>
                {day.substring(0, 3)}
              </th>
            ))}
          </tr>
          <tr>
            <th>Nurses</th>
            {new Array(days.length * 2).fill(null).map((_, index) => (
              <th key={index} style={{ textAlign: "center" }}>
                {index % 2 === 0 ? "D" : "N"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nurses &&
            nurses.map((nurse) => (
              <tr key={nurse.id}>
                <td>{nurse.name}</td>
                {scheduleByNurse[nurse.id].map(
                  (shift: number, index: number) => {
                    return (
                      <td
                        key={index}
                        style={{
                          backgroundColor: shift ? "#a5aded" : "transparent",
                        }}
                      ></td>
                    );
                  }
                )}
              </tr>
            ))}
          <tr style={{ backgroundColor: "#f2e7c6" }}>
            <td>Total Nurses Assigned</td>
            {new Array(days.length * 2).fill(null).map((_, index) => {
              const currentDay = indexToDayMap[index];
              const shiftType = index % 2 === 0 ? "day" : "night";
              return <td>{easyReadNursesAssigned[currentDay][shiftType]}</td>;
            })}
          </tr>
          <tr style={{ backgroundColor: "#f2e7c6" }}>
            <td>Total Nurses Required</td>
            {new Array(days.length * 2).fill(null).map((_, index) => {
              const currentDay = indexToDayMap[index];
              const shiftType = index % 2 === 0 ? "day" : "night";
              return <td>{easyReadRequirements[currentDay][shiftType]}</td>;
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleDetails;
