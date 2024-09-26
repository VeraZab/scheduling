import { useEffect, useState } from "react";
import * as api from "./services/apiService";
import m7Logo from "/Logo-black.png";
import "./App.css";
import NursePreferences from "./components/NursePreferences";
import ScheduleDetails from "./components/ScheduleDetails";

function App() {
  const [nurses, setNurses] = useState<unknown[] | null>(null);
  const [requirements, setRequirements] = useState<unknown[] | null>(null);
  const [schedules, setSchedules] = useState<unknown[] | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");

  useEffect(() => {
    const fetchNurses = async () => {
      const nurses = await api.default.getNurses(); // TODO: this appears to be getting called twice on page load... why?
      setNurses(nurses);
    };

    fetchNurses().catch(console.error);
  }, []);

  useEffect(() => {
    const fetchRequirements = async () => {
      const requirements = await api.default.getShiftRequirements();
      setRequirements(requirements);
    };

    fetchRequirements().catch(console.error);
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      const schedules = await api.default.getSchedules();
      setSchedules(schedules);
    };

    fetchSchedules().catch(console.error);
  }, []);

  return (
    <div className="contentContainer">
      <div>
        <a href="https://m7health.com" target="_blank">
          <img src={m7Logo} className="logo" alt="M7 Health logo" />
        </a>
      </div>
      <div className="card">
        <h2>Nurse Preferences</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {nurses &&
              nurses.map((nurse: any) => (
                <tr key={nurse.id}>
                  <td>{nurse.id}</td>
                  <td>
                    <NursePreferences id={nurse.id} name={nurse.name} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2>Shift Requirements</h2>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Shift</th>
              <th>Nurses required</th>
            </tr>
          </thead>
          <tbody>
            {requirements &&
              requirements.map((req: any) => (
                <tr key={req.dayOfWeek + "-" + req.shift}>
                  <td>{req.dayOfWeek}</td>
                  <td>{req.shift}</td>
                  <td>{req.nursesRequired}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2>Schedules</h2>
        <div className="scheduleControlsContainer">
          <button
            onClick={async () => {
              const newSchedule = await api.default.generateSchedule();
              const newSchedules = schedules
                ? [...schedules, newSchedule]
                : [newSchedule];
              setSchedules(newSchedules);
              setSelectedScheduleId(newSchedule.id);
            }}
          >
            GENERATE SCHEDULE
          </button>
          <div>
            <select
              className="scheduleDropdown"
              onChange={(event) => {
                setSelectedScheduleId(event.target.value);
              }}
              value={selectedScheduleId}
            >
              <option value="">Select Schedule</option>
              {schedules &&
                schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {`Schedule id: ${schedule.id}`}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="scheduleContainer">
          {schedules &&
            selectedScheduleId &&
            schedules.find((sc) => sc.id.toString() === selectedScheduleId) && (
              <ScheduleDetails
                schedule={schedules.find(
                  (sc) => sc.id.toString() === selectedScheduleId
                )}
                nurses={nurses}
                requirements={requirements}
              />
            )}

          {schedules && schedules.length != 0 && !selectedScheduleId && (
            <div className="scheduleMessageContainer">
              Please select a schedule to display
            </div>
          )}

          {!schedules ||
            (schedules.length === 0 && (
              <div className="scheduleMessageContainer">
                Please generate a schedule
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default App;
