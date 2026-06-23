import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { demoMedicines, demoPharmacies } from "../../data/mockData";
import { ApiClient } from "../../services/api";
import { Medicine } from "../../types";
import { DataTable } from "../../components/ui/DataTable";
import { Field } from "../../components/ui/Field";

type AvailabilityPanelProps = {
  api: ApiClient;
};

export function AvailabilityPanel({ api }: AvailabilityPanelProps) {
  const [medicineId, setMedicineId] = useState("");
  const [city, setCity] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>(demoMedicines);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ medicines: Medicine[] }>("/catalog/medicines").then((data) => setMedicines(data.medicines)).catch(() => setMedicines(demoMedicines));
  }, [api]);

  const search = () => {
    const params = new URLSearchParams();
    if (medicineId) params.set("medicineId", medicineId);
    if (city) params.set("city", city);
    api.get<{ inventory: any[] }>(`/catalog/availability?${params.toString()}`).then((data) => setInventory(data.inventory)).catch(() => setInventory([]));
  };

  return (
    <section className="section-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Medicine stock</p>
          <h2>Nearby pharmacy availability</h2>
        </div>
        <button className="primary-button compact" onClick={search}>
          <Search size={17} />
          Search
        </button>
      </div>
      <div className="filters-row">
        <label className="field">
          <span>Medicine</span>
          <select value={medicineId} onChange={(event) => setMedicineId(event.target.value)}>
            <option value="">All medicines</option>
            {medicines.map((medicine) => (
              <option key={medicine.id} value={medicine.id}>
                {medicine.brandName}
              </option>
            ))}
          </select>
        </label>
        <Field label="City" value={city} onChange={setCity} />
      </div>
      <DataTable
        columns={["Pharmacy", "Medicine", "Quantity", "City", "Phone"]}
        rows={(inventory.length ? inventory : demoPharmacies.map((pharmacy, index) => ({ pharmacy, medicine: demoMedicines[index % demoMedicines.length], quantity: 18 + index }))).map((item) => [
          item.pharmacy?.name,
          item.medicine?.brandName || item.medicineName,
          item.quantity,
          item.pharmacy?.city,
          item.pharmacy?.phone,
        ])}
      />
    </section>
  );
}
