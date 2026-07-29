import { FormEvent, useEffect, useState } from "react";
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
  const [medicineQuery, setMedicineQuery] = useState("");
  const [city, setCity] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>(demoMedicines);
  const [inventory, setInventory] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    api.get<{ medicines: Medicine[] }>("/catalog/medicines").then((data) => setMedicines(data.medicines)).catch(() => setMedicines(demoMedicines));
  }, [api]);

  const search = (event?: FormEvent) => {
    event?.preventDefault();
    const params = new URLSearchParams();
    if (medicineQuery.trim()) params.set("q", medicineQuery.trim());
    if (city) params.set("city", city);
    setSearched(true);
    api.get<{ inventory: any[] }>(`/catalog/availability?${params.toString()}`).then((data) => setInventory(data.inventory)).catch(() => setInventory([]));
  };

  return (
    <section className="section-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Medicine stock</p>
          <h2>Nearby pharmacy availability</h2>
        </div>
        <button className="primary-button compact" onClick={() => search()}>
          <Search size={17} />
          Search
        </button>
      </div>
      <form className="filters-row" onSubmit={search}>
        <label className="field">
          <span>Medicine name</span>
          <input list="availability-medicines" value={medicineQuery} placeholder="Search Dolo, Crocin, Paracetamol" onChange={(event) => setMedicineQuery(event.target.value)} />
        </label>
        <Field label="City" value={city} onChange={setCity} />
        <button className="primary-button compact mobile-only" type="submit">
          <Search size={17} />
          Search
        </button>
      </form>
      <datalist id="availability-medicines">
        {medicines.map((medicine) => (
          <option key={medicine.id} value={medicine.brandName}>
            {medicine.genericName}
          </option>
        ))}
      </datalist>
      <DataTable
        columns={["Pharmacy", "Medicine", "Quantity", "City", "Phone"]}
        rows={(inventory.length || searched ? inventory : demoPharmacies.map((pharmacy, index) => ({ pharmacy, medicine: demoMedicines[index % demoMedicines.length], quantity: 18 + index }))).map((item) => [
          item.pharmacy?.name,
          item.medicine?.brandName || item.medicineName,
          item.quantity,
          item.pharmacy?.city,
          item.pharmacy?.phone,
        ])}
      />
      {searched && !inventory.length && <p className="empty-state">No pharmacy stock found for this search.</p>}
    </section>
  );
}
