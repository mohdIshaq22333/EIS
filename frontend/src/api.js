const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  let response;

  try {
    response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
  } catch (error) {
    throw new Error(`Network error: ${error.message}`);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      body?.errors?.join(", ") || body?.detail || response.statusText,
    );
  }

  return body;
}

export function fetchStudents(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return request(`/students/${query}`);
}

export function fetchStudentDetail(admissionNo) {
  return request(`/students/${encodeURIComponent(admissionNo)}/`);
}

export function fetchSummary() {
  return request("/summary/");
}

export function postCorrection(payload) {
  return request("/marks/corrections/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
