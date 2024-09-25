import { useEffect, useState } from "react";
import * as api from "../services/apiService";

const NursePreferences = ({ id, name, days }) => {
  // state for show depending on button click on the nurse itself to show details page
  const [showNursePreferredShifts, setShowNursePreferredShifts] =
    useState(false);
  // preferred shifts represents nurse preferences for the week in a format that makes it easy to render
  const [nursePreferredShifts, setNursePreferredShifts] = useState({
    Monday: "",
    Tuesday: "",
    Wednesday: "",
    Thursday: "",
    Friday: "",
    Saturday: "",
    Sunday: "",
  });
  const shifts = ["day", "night"];

  const handleClick = () => {
    setShowNursePreferredShifts((show) => !show);
  };

  const handleSubmitPreferences = (event) => {
    const setPreferences = async () => {
      const shiftValues = Object.values(nursePreferredShifts);
      let shiftsToPost = shiftValues.map((shift, ind) => {
        return { dayOfWeek: days[ind], shift: shift };
      });
      shiftsToPost = shiftsToPost.filter((shiftDict) => shiftDict.shift !== "");
      return api.default.setNursePreferences(id, JSON.stringify(shiftsToPost));
    };
    event.preventDefault();
    setPreferences().catch(console.error);
  };

  useEffect(() => {
    // converts the preferences from the API to the format that is used in the state of nursePreferredShifts
    const fetchPreferences = async () => {
      let nursePreferences = await api.default.getNursePreferences(id);
      if (!nursePreferences) {
        nursePreferences = [];
      }
      const newPreferredShifts = {
        Monday: "",
        Tuesday: "",
        Wednesday: "",
        Thursday: "",
        Friday: "",
        Saturday: "",
        Sunday: "",
      };
      nursePreferences.forEach((nursePreference) => {
        newPreferredShifts[nursePreference.dayOfWeek] = nursePreference.shift;
      });
      setNursePreferredShifts(newPreferredShifts);
    };
    fetchPreferences().catch(console.error);
  }, [id]);

  return (
    <div>
      <button onClick={handleClick}>{name}</button>
      {showNursePreferredShifts && (
        <div>
          Pick at least 3 preferred shifts for the week:
          <form onSubmit={handleSubmitPreferences}>
            <table className="nurse-preferences">
              <thead>
                <tr>
                  <th>Day of the Week:</th>
                  <th>Type of Shift:</th>
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={"preference for " + day + " nurse with id " + id}>
                    <td>{day}</td>
                    <td>
                      {shifts.map((shift) => (
                        <span key={shift}>
                          <input
                            type="checkbox"
                            name={day}
                            value={shift}
                            checked={nursePreferredShifts[day] === shift}
                            onChange={(e) => {
                              setNursePreferredShifts({
                                ...nursePreferredShifts,
                                [day]: e.target.checked ? e.target.value : "",
                              });
                            }}
                          />

                          <label htmlFor={shift} style={{ marginRight: "5px" }}>
                            {shift}
                          </label>
                        </span>
                      ))}

                      <br />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <input type="submit" name="submit" value="Submit" />
          </form>
        </div>
      )}
    </div>
  );
};

export default NursePreferences;
