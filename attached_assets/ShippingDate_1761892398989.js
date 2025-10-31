// TEST UTILITIES - Use to test "Ball Drop" at anytime. 
// Add  "elapsedSeconds++;" to updateCountdown() to simulate runtime
// Comment out variables and return in getCurrentDate() and add "return getTestDate()"
// let elapsedSeconds = 0;

// function getTestDate() {
//   const testTime = new Date("November 20, 2023 11:59:40");
//   testTime.setSeconds(testTime.getSeconds() + elapsedSeconds);
//   return testTime;
// }

// Adds ordinal suffix to the dates in the table (nd, rd, th)
function ordinalSuffix(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Returns an object with two properties - the first a date object 
 * of the delivery date and the second a boolean signifying if the 
 * transit time contains a shipping holiday.
 * 
 * @param {*} additionalDays the number of shipping days until delivery
 * @returns 
 */
function calculateDeliveryDate(additionalDays) {
  const now = getCurrentDate();
  const deliveryDate = getShipDate(now);

  let containsShippingHoliday = false;

  while (additionalDays > 0) {
    // increment day by one as we do not ship and deliver on the same day
    deliveryDate.setDate(deliveryDate.getDate() + 1);

    const shippingHoliday = isShippingHoliday(deliveryDate);
    if (shippingHoliday) {
      containsShippingHoliday = true;
    }

    const weekend = isWeekend(deliveryDate);
    if (!shippingHoliday && !weekend) {
      additionalDays--;
    }
  }
  return {
    deliveryDate: deliveryDate,
    containsShippingHoliday: containsShippingHoliday
  };
}

// Formats date into "Day, Month, Date"
function formatDate(date) {
  const dayWithSuffix = ordinalSuffix(date.getDate());
  const dayName = date.toLocaleDateString("en-US", { weekday: 'long' });
  const monthName = date.toLocaleDateString("en-US", { month: 'long' });
  return `${dayName}, ${monthName} ${dayWithSuffix}`;
}

/** Shipping holidays packages do not leave REAL or make any transit progress. 
* Format: new Date("Nov 13, 2023")
*/
const shippingHolidays = [
  new Date("Nov 23, 2023"),
  new Date("Dec 25, 2023"),
  new Date("Jan 1, 2024")
];

//Checks if date is a Saturday or Sunday and returns boolean
function isWeekend(date) {
  return date.getDay() === 6 || date.getDay() === 0;
}

//Checks if date is a shipping holiday and returns boolean
function isShippingHoliday(date) {
  for (const holiday of shippingHolidays) {
    if (holiday.getDate() === date.getDate()
      && holiday.getMonth() === date.getMonth()
      && holiday.getYear() === date.getYear()) {
      return true;
    }
  }

  return false;
}

// Populates the next shipping cutoff time taking into account weekends and shipping holidays
function getShipDate(now) {
  const shipDate = new Date(now);
  shipDate.setHours(12, 0, 0, 0);

  if (now.getHours() >= 12) {
    shipDate.setDate(shipDate.getDate() + 1);
  }

  while (isShippingHoliday(shipDate) || isWeekend(shipDate)) {
    shipDate.setDate(shipDate.getDate() + 1);
  }

  return shipDate;
}

function populateDeliveryDates() {
  const shippingSpeeds = {
    "8-10 Business Days": 10,
    "5-7 Business Days": 7,
    "3-4 Business Days": 4,
    "2 Business Days": 2,
    "Overnight (1 Business Day)": 1
  };

  let tableHTML = "<tr><td><strong>Guarenteed Delivery On or Before</strong></td>";

  let showHolidayMessage = false;

  for (const days of Object.values(shippingSpeeds)) {
    const deliveryDate = calculateDeliveryDate(days);
    let astericks = "";
    if (deliveryDate.containsShippingHoliday) {
      astericks = "*"
      showHolidayMessage = true;
    }
    const formattedDate = formatDate(deliveryDate.deliveryDate) + astericks;
    tableHTML += `<td class="delivery-date">${formattedDate}</td>`;
  }

  if (!showHolidayMessage) {
    document.getElementById('holiday-message').style.visibility = 'hidden';
    document.getElementById('holiday-message').style.display = 'none';
  };

  tableHTML += "</tr>";

  const deliveryDatesTable = document.getElementById('deliveryDatesTable');
  if (deliveryDatesTable.innerHTML != tableHTML) {
    deliveryDatesTable.innerHTML = tableHTML;
  }

}


function getCurrentDate() {
  const userTime = new Date();
  const nyTime = new Date(userTime.toLocaleString("en-US", { timeZone: "America/New_York" }));
  return nyTime;
}
/**
 * Updates the "order before" paragraph based on the next time FedEx will pick up packages.
 * 
 */
function updateOrderBeforeDate() {
  const now = getCurrentDate();
  const orderBeforeDate = getShipDate(now);
  document.getElementById('shipping-cutoff').textContent = formatDate(orderBeforeDate);
}


let prevHours, prevMinutes, prevSeconds, prevDays;

function updateCountdown() {
  const now = getCurrentDate();
  const deadline = getShipDate(now);
  const t = deadline.getTime() - now.getTime();
  // const tZero = t / 1000 / 60 * 60;

  const days = Math.floor((t / ((1000 * 60 * 60 * 24))) % 24);
  const hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((t % (1000 * 60)) / 1000);

  // Compare the current and previous values for animation
  if (days !== prevDays) {
    document.getElementById("days").style.animation = 'flashGrey 0,5s';
  }
  if (hours !== prevHours) {
    document.getElementById("hours").style.animation = 'flashGrey 0.5s';
  }
  if (minutes !== prevMinutes) {
    document.getElementById("minutes").style.animation = 'flashGrey 0.5s';
  }
  if (seconds !== prevSeconds) {
    document.getElementById("seconds").style.animation = 'flashGrey 0.5s';
  }

  // Stores the current values for the next iteration
  prevDays = days;
  prevHours = hours;
  prevMinutes = minutes;
  prevSeconds = seconds;

  document.getElementById("days").innerText = days;
  document.getElementById("hours").innerText = hours;
  document.getElementById("minutes").innerText = minutes;
  document.getElementById("seconds").innerText = seconds;

  if (t < 0) {
    clearInterval(interval);
    document.getElementById("days").innerText = '0';
    document.getElementById("hours").innerText = '0';
    document.getElementById("minutes").innerText = '0';
    document.getElementById("seconds").innerText = '0';
  }

  // Conditional statements for setElementVisibility and singularize functions to simplify countdown when needed
  if (days < 1) {
    hideElementVisibility('#days, #days-plural');
  } else { toggleBackVisibility('#days, #days-plural') }
  if (hours < 1 && days === 0) {
    hideElementVisibility('#hours, #hours-plural');
  } else { toggleBackVisibility('#hours, #hours-plural') }
  if (days > 0) {
    hideElementVisibility('#seconds, #seconds-plural');
  } else { toggleBackVisibility('#seconds, #seconds-plural') }
  if (days === 1) {
    singularize('days-plural', 'Day');
  } else { pluralize('days-plural', 'Days') }
  if (hours === 1) {
    singularize('hours-plural', 'Hour');
  } else { pluralize('hours-plural', 'Hours') }
  if (minutes === 1) {
    singularize('minutes-plural', 'Minute');
  } else { pluralize('minutes-plural', 'Minutes') }

  updateOrderBeforeDate();
  populateDeliveryDates();
}


// Hide Elements in the countdown if their values are zero
function hideElementVisibility(selector) {
  document.querySelectorAll(selector).forEach(element => {
    element.style.visibility = 'hidden';
    element.style.display = 'none';
  });
}

// Toggles Element's visiblities back in the countdown if their values are greater than Zero
function toggleBackVisibility(selector) {
  let element = document.querySelectorAll(selector);
  element.forEach(element => {
    if (element.style.visibility === 'hidden' || element.style.display === 'none') {
      element.style.visibility = 'visible';
      element.style.display = 'inline';
    }
  });
}

// Modifies Days, Hours, and Minutes to singular form when values equal 1 (expections apply)
function singularize(id, singularForm) {
  if (document.getElementById(id)) {
    document.getElementById(id).innerText = singularForm;
  }
}

function pluralize(id, pluralForm) {
  if (document.getElementById(id)) {
    document.getElementById(id).innerText = pluralForm;
  }
}


document.getElementById("days").addEventListener('animationend', removeAnimation);
document.getElementById("hours").addEventListener('animationend', removeAnimation);
document.getElementById("minutes").addEventListener('animationend', removeAnimation);
document.getElementById("seconds").addEventListener('animationend', removeAnimation);

function removeAnimation(e) {
  e.target.style.animation = '';
}

// setInterval will repeatedly updateCountdown every 1000 milliseconds (1 second)
const countdownInterval = setInterval(updateCountdown, 1000);
// Immediately update the countdown on page load
updateCountdown(); 