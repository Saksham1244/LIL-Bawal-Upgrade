/**
 * Factory Shift Timings:
 * - Shift 1 (A): 07:00 AM to 02:00 PM (07:00 - 14:00)
 * - Shift 2 (B): 02:00 PM to 10:00 PM (14:00 - 22:00)
 * - Shift 3 (C): 10:00 PM to 07:00 AM (22:00 - 07:00)
 */

export const getActiveShift = (date = new Date()) => {
  const hour = date.getHours();

  if (hour >= 7 && hour < 14) {
    return {
      letter: "A",
      number: 1,
      name: "Shift 1",
      code: "Shift A",
      timing: "07:00 AM - 02:00 PM",
    };
  }

  if (hour >= 14 && hour < 22) {
    return {
      letter: "B",
      number: 2,
      name: "Shift 2",
      code: "Shift B",
      timing: "02:00 PM - 10:00 PM",
    };
  }

  return {
    letter: "C",
    number: 3,
    name: "Shift 3",
    code: "Shift C",
    timing: "10:00 PM - 07:00 AM",
  };
};

export const getShiftName = (date = new Date()) => getActiveShift(date).name;
export const getShiftLetter = (date = new Date()) => getActiveShift(date).letter;
export const getShiftCode = (date = new Date()) => getActiveShift(date).code;
