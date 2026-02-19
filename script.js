:root {
  --wood-dark: #4a3b2a;
  --wood-medium: #8b5a2b;
  --wood-light: #d2b48c;
  --cream: #fff8dc;
  --white: #ffffff;
  --text-dark: #2c2c2c;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --radius: 8px;
}

* {
  box-sizing: border-box;
}

body {
  background-color: #f4efe6;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text-dark);
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

h1 {
  background-color: var(--wood-dark);
  color: var(--white);
  padding: 15px;
  margin: 0;
  text-align: center;
  font-size: 1.4rem;
  letter-spacing: 1px;
  box-shadow: var(--shadow);
}

h2 {
  color: var(--wood-dark);
  border-bottom: 2px solid var(--wood-medium);
  padding-bottom: 10px;
  margin-top: 0;
  font-size: 1.2rem;
}

.container {
  max-width: 800px;
  width: 95%;
  /* Better mobile width */
  margin: 20px auto;
  background: var(--white);
  padding: 15px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border-top: 5px solid var(--wood-medium);
}

/* Card Style for Dashboard Sections */
.dashboard-card {
  background: var(--cream);
  padding: 15px;
  border-radius: var(--radius);
  margin-bottom: 20px;
  border: 1px solid var(--wood-light);
}

label {
  display: block;
  margin-top: 15px;
  font-weight: 600;
  color: var(--wood-dark);
  font-size: 0.9rem;
}

input,
select {
  width: 100%;
  padding: 12px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: var(--radius);
  font-size: 16px;
  /* Prevents zoom on iOS */
  background: #fff;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--wood-medium);
  box-shadow: 0 0 0 2px rgba(139, 90, 43, 0.2);
}

/* Button Styling Updated */
button {
  background: var(--wood-medium);
  color: white;
  padding: 12px;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 15px;
  font-weight: bold;
  width: 100%;
  /* Full width on mobile default */
  margin-top: 15px;
  transition: background 0.2s;
  text-align: center;
}

button:hover {
  background: var(--wood-dark);
}

button.secondary {
  background: #6c757d;
}

button.danger {
  background: #dc3545;
}

/* Table Styling */
.table-wrapper {
  overflow-x: auto;
  /* Scrollable tables on mobile */
  margin-top: 20px;
  border-radius: var(--radius);
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.05);
  background: white;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
  /* Forces scroll on very small screens */
}

th,
td {
  padding: 10px;
  /* Slightly reduced padding */
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
}

th {
  background: var(--wood-medium);
  color: white;
  white-space: nowrap;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

/* Alert Box */
#alertBox {
  color: #d9534f;
  background: #fdf7f7;
  padding: 10px;
  border: 1px solid #d9534f;
  border-radius: var(--radius);
  margin-top: 15px;
  font-weight: bold;
  font-size: 0.9rem;
}

/* Bill Output Section */
#billOutput {
  margin-top: 20px;
  background: white;
  padding: 15px;
  border: 1px dashed var(--wood-dark);
  border-radius: var(--radius);
  font-size: 0.95rem;
  overflow-x: hidden;
  /* Prevent horizontal scroll in container */
}

/* Utilities & Layout */
.row-flex {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  /* Allow wrapping on very small screens */
}

.full-width {
  width: 100%;
  flex: 1;
  /* Allow it to grow */
}

/* Responsive adjustments */
@media (min-width: 600px) {
  .row-flex {
    flex-wrap: nowrap;
    /* No wrap on desktop/tablet */
  }

  button {
    width: auto;
    min-width: 120px;
    display: inline-block;
  }

  .dashboard-card button {
    margin-right: 10px;
    margin-bottom: 0;
  }
}

/* Mobile specific fixes */
@media (max-width: 599px) {
  h1 {
    font-size: 1.2rem;
  }

  .container {
    padding: 10px;
    width: 98%;
  }

  th,
  td {
    padding: 8px;
    font-size: 0.85rem;
  }

  /* Ensure buttons stack neatly */
  .row-flex button {
    width: 100%;
    margin-top: 5px;
  }

  /* Adjust quick action buttons */
  .dashboard-card button {
    margin-bottom: 10px;
  }

  .dashboard-card button:last-child {
    margin-bottom: 0;
  }
}
