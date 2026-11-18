/* ==========================================================
   IPL Ticket Booking - app.js
   Activity 5: DOM manipulation, events, toast, smooth scroll
   ========================================================== */

   "use strict";

   /* ---------- 1. REUSABLE TOAST NOTIFICATION ----------
      Usage: showToast("Message");
             showToast("Saved!", "success");
             showToast("Something went wrong", "error", 5000);
      type: "success" | "error" | "info"   (default "info")
      duration: time in ms before it disappears (default 3000)
   */
   function showToast(message, type = "info", duration = 3000) {
     // Create the container once and reuse it for every toast
     let container = document.getElementById("toast-container");
     if (!container) {
       container = document.createElement("div");
       container.id = "toast-container";
       container.setAttribute("aria-live", "polite"); // screen readers announce it
       document.body.appendChild(container);
     }
   
     // Build the toast element
     const toast = document.createElement("div");
     toast.className = `toast toast-${type}`;
     toast.textContent = message;
     container.appendChild(toast);
   
     // Trigger the CSS slide-in animation on the next frame
     requestAnimationFrame(() => toast.classList.add("show"));
   
     // Auto-remove after `duration`
     setTimeout(() => {
       toast.classList.remove("show");
       toast.addEventListener("transitionend", () => toast.remove(), { once: true });
       setTimeout(() => toast.remove(), 500); // fallback if no transition fires
     }, duration);
   }
   
   /* ---------- 2. SMOOTH SCROLL TO THE BOOKING FORM ----------
      Every button with class "book-btn" scrolls to the booking form,
      pre-selects the match from its data-match attribute and shows a toast.
   */
   function scrollToBooking(matchValue, matchName) {
     const bookingSection = document.getElementById("booking");
     if (!bookingSection) {
       // Not on the home page (e.g. on booking.html): go to the booking page
       window.location.href = "booking.html";
       return;
     }
   
     bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
   
     // Pre-select the chosen match in the dropdown
     const matchSelect = document.getElementById("match");
     if (matchSelect && matchValue) {
       matchSelect.value = matchValue;
       updateSummary(false); // refresh the summary card without a second toast
     }
   
     // Move focus to the first field after the scroll finishes
     setTimeout(() => {
       const firstField = document.getElementById("name");
       if (firstField) firstField.focus({ preventScroll: true });
     }, 700);
   
     showToast(`${matchName} selected. Fill in your details to book!`, "success");
   }
   
   document.querySelectorAll(".book-btn").forEach((btn) => {
     btn.addEventListener("click", () => {
       scrollToBooking(btn.dataset.match, btn.dataset.name);
     });
   });
   
   /* ---------- 3. FORM EVENTS ---------- */
   
   // Home page booking form
   const homeForm = document.querySelector("#booking form");
   if (homeForm && homeForm.id !== "bookingForm") {
     homeForm.addEventListener("submit", (e) => {
       e.preventDefault(); // runs only after HTML5 validation passes
       showToast("Booking confirmed! Check your email for the ticket.", "success", 4000);
       homeForm.reset();
       updateSummary(false);
     });
   }
   
   // Full booking page form (booking.html)
   const bookingForm = document.getElementById("bookingForm");
   if (bookingForm) {
     const successMsg = document.getElementById("successMsg");
   
     bookingForm.addEventListener("submit", (e) => {
       e.preventDefault();
       if (successMsg) successMsg.hidden = false;
       showToast("Booking submitted successfully!", "success", 4000);
     });
   
     bookingForm.addEventListener("reset", () => {
       if (successMsg) successMsg.hidden = true;
       showToast("Form has been reset.", "info");
     });
   }
   
   /* ---------- 4. SMOOTH SCROLL FOR NAV LINKS ---------- */
   document.querySelectorAll('a[href^="#"]').forEach((link) => {
     link.addEventListener("click", (e) => {
       const target = document.querySelector(link.getAttribute("href"));
       if (target) {
         e.preventDefault();
         target.scrollIntoView({ behavior: "smooth", block: "start" });
       }
     });
   });
   
   /* ---------- 5. LIVE BOOKING SUMMARY (Activity 7) ----------
      Reads the Match, Stand and Quantity controls, calculates the total
      and updates the Booking Summary Card without reloading the page.
   */
   const matchSelect   = document.getElementById("match");
   const standSelect   = document.getElementById("stand");
   const ticketsInput  = document.getElementById("tickets");
   
   // Format a number as Indian rupees, e.g. 5000 -> "₹5,000"
   function formatINR(amount) {
     return "\u20B9" + amount.toLocaleString("en-IN");
   }
   
   function updateSummary(announce = true) {
     // Summary card only exists on the home page
     if (!matchSelect || !standSelect || !ticketsInput) return;
     if (!document.getElementById("summaryCard")) return;
   
     // 1. READ the user's choices
     const matchOpt = matchSelect.options[matchSelect.selectedIndex];
     const standOpt = standSelect.options[standSelect.selectedIndex];
     const qty      = parseInt(ticketsInput.value, 10);
   
     const hasMatch = matchSelect.value !== "";
     const hasStand = standSelect.value !== "";
     const validQty = Number.isInteger(qty) && qty >= 1 && qty <= 10;
   
     // 2. CALCULATE the total (price per ticket x quantity)
     const price = hasStand ? Number(standOpt.dataset.price) : 0;
     const total = hasStand && validQty ? price * qty : 0;
   
     // 3. DISPLAY it in the Booking Summary Card
     document.getElementById("sumMatch").textContent =
       hasMatch ? matchOpt.dataset.name : "\u2014";
     document.getElementById("sumVenue").textContent =
       hasMatch ? `${matchOpt.dataset.date}, ${matchOpt.dataset.venue}` : "\u2014";
     document.getElementById("sumStand").textContent =
       hasStand ? standOpt.dataset.name : "\u2014";
     document.getElementById("sumPrice").textContent =
       hasStand ? formatINR(price) : "\u2014";
     document.getElementById("sumQty").textContent =
       validQty ? qty : "\u2014";
     document.getElementById("sumTotal").textContent = formatINR(total);
   
     const note = document.getElementById("sumNote");
     if (!validQty) {
       note.textContent = "Tickets must be between 1 and 10.";
     } else if (!hasMatch || !hasStand) {
       note.textContent = "Select a match and stand to see your total.";
     } else {
       note.textContent = `${qty} x ${formatINR(price)} = ${formatINR(total)}`;
     }
   
     // Small highlight animation on the card
     const card = document.getElementById("summaryCard");
     card.classList.remove("updated");
     void card.offsetWidth; // restart the animation
     card.classList.add("updated");
   
     // 4. CONFIRM with a toast
     if (!announce) return;
     if (!validQty) {
       showToast("Please enter 1 to 10 tickets.", "error");
     } else if (hasMatch && hasStand) {
       showToast(`Summary updated: ${formatINR(total)} total`, "success");
     } else {
       showToast("Summary updated", "info", 1500);
     }
   }
   
   // change fires when a dropdown choice changes or a number input is committed;
   // input makes the quantity react while typing / using the spinner arrows
   [matchSelect, standSelect, ticketsInput].forEach((el) => {
     if (el) el.addEventListener("change", () => updateSummary(true));
   });
   if (ticketsInput) {
     ticketsInput.addEventListener("input", () => updateSummary(false));
   }
   
   // Reset button / form reset clears the summary too
   if (homeForm) {
     homeForm.addEventListener("reset", () => setTimeout(() => updateSummary(false), 0));
   }
   
   /* ==========================================================
      6. RESPONSIVE LAYOUT INTERACTIONS (Activity 8)
      ========================================================== */
   
   /* ---------- 6a. Hamburger menu: toggle the "open" class ---------- */
   const navToggle = document.getElementById("navToggle");
   const navLinks  = document.getElementById("navLinks");
   
   function setMenu(open) {
     navLinks.classList.toggle("open", open);
     navToggle.setAttribute("aria-expanded", String(open));
   }
   
   if (navToggle && navLinks) {
     navToggle.addEventListener("click", () => {
       setMenu(!navLinks.classList.contains("open"));
     });
   
     // Close the menu after choosing a link
     navLinks.querySelectorAll("a").forEach((link) => {
       link.addEventListener("click", () => setMenu(false));
     });
   
     // Close with the Escape key
     document.addEventListener("keydown", (e) => {
       if (e.key === "Escape") setMenu(false);
     });
   
     // Reset when the screen becomes wide again
     window.addEventListener("resize", () => {
       if (window.innerWidth > 768) setMenu(false);
     });
   }
   
   /* ---------- 6b. Filter match cards by team ---------- */
   const teamFilter = document.getElementById("teamFilter");
   const matchGrid  = document.getElementById("matchGrid");
   
   function filterMatches(announce = true) {
     const team  = teamFilter.value;                     // e.g. "csk" or "all"
     const cards = matchGrid.querySelectorAll(".match-card");
     let visible = 0;
   
     cards.forEach((card) => {
       // data-teams="rcb csk" -> ["rcb", "csk"]
       const teams = card.dataset.teams.split(" ");
       const show  = team === "all" || teams.includes(team);
       card.hidden = !show;
       if (show) visible++;
     });
   
     document.getElementById("matchCount").textContent =
       `Showing ${visible} of ${cards.length} matches`;
     document.getElementById("noMatches").hidden = visible !== 0;
   
     if (announce) {
       showToast(
         team === "all" ? "Showing all matches" : `${visible} match(es) found`,
         visible ? "info" : "error",
         1800
       );
     }
   }
   
   if (teamFilter && matchGrid) {
     teamFilter.addEventListener("change", () => filterMatches(true));
   }
   
   /* ---------- 6c. Toggle between grid and list view ---------- */
   const gridBtn = document.getElementById("gridViewBtn");
   const listBtn = document.getElementById("listViewBtn");
   
   function setView(view) {
     const isList = view === "list";
     matchGrid.classList.toggle("list-view", isList);
   
     gridBtn.classList.toggle("active", !isList);
     listBtn.classList.toggle("active", isList);
     gridBtn.setAttribute("aria-pressed", String(!isList));
     listBtn.setAttribute("aria-pressed", String(isList));
   }
   
   if (gridBtn && listBtn && matchGrid) {
     gridBtn.addEventListener("click", () => setView("grid"));
     listBtn.addEventListener("click", () => setView("list"));
   }