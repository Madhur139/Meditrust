import axios from "axios";

const fetchData = async () => {
  const responseForMedicines = await axios.get("/api/products");
  const responseForDoctors = await axios.get("/api/doctor");
  const responseForPathologist = await axios.get("/api/pathologist");
  const responseForTests = await axios.get("/api/pathologist/tests");

  const medicines = responseForMedicines.data.sort((a, b) => a.stock - b.stock);
  const doctors = responseForDoctors.data;
  const pathologist = responseForPathologist.data;
  const tests = responseForTests.data;

  return {
    medicines: medicines.splice(4),
    doctors: doctors,
    pathologist: pathologist,
    tests: tests,
  };
};

const medicalService = { fetchData };

export default medicalService;
