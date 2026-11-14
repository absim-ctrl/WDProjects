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