const response = await fetch("http://localhost:5000/api/contact", {
  headers: {
    accept: "application/json, text/plain, */*",
    authorization: "Bearer 2b2e0d3c-0dd7-4743-bf6d-a2e9eedb4d3a",
    "content-type": "application/json",
  },
  body: '{"data":{"phoneNumber":"628123456789008001700","address":"Jl. Plastik HB No. 123, Bandung New 1 1","mapUrl":"https://www.google.com/maps?q=-6.914744,107.609810&z=15&output=embed"}}',
  method: "PUT",
});
console.log(response.status, await response.text());
