"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDistributors,
  addDistributor,
  updateDistributor,
  deleteDistributor,
  selectDistributors,
  selectLoading,
  selectError,
} from "@/lib/redux/distributorSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { AppDispatch } from "@/lib/store";
import { Loader, Loader2 } from "lucide-react";
import type { Distributor } from "@/lib/redux/distributorSlice";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { fetchStocks, selectStocks } from "@/lib/redux/stockSlice";
import type { Stock } from "@/lib/redux/stockSlice";

type DistributorForm = {
  name: string;
  password?: string;
  phone: string;
  address: string;
  pincode: string;
};

const emptyForm: DistributorForm = { name: "", password: "", phone: "", address: "", pincode: "" };

const DistributorsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const distributors = useSelector(selectDistributors);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [form, setForm] = useState<DistributorForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"distributors" | "stocks">("distributors");
  const [search, setSearch] = useState("");
  const [stockSearch, setStockSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("ALL");

  useEffect(() => {
    dispatch(fetchDistributors());
    dispatch(fetchStocks());
  }, [dispatch]);

  // Filter distributors by pincode
  const filteredDistributors = distributors && search
    ? distributors.filter((d: Distributor) => d.pincode.toLowerCase().includes(search.toLowerCase()))
    : distributors;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    setActionLoadingId("add");
    await dispatch(addDistributor(form));
    setForm(emptyForm);
    setDialogOpen(false);
    setActionLoadingId(null);
    dispatch(fetchDistributors());
  };

  const handleEdit = (dist: Distributor) => {
    setEditId(dist._id ?? null);
    setForm({
      name: dist.name,
      password: "",
      phone: dist.phone,
      address: dist.address,
      pincode: dist.pincode,
    });
    setDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (editId) {
      setActionLoadingId(editId);
      const updateData = { ...form };
      delete updateData.password; // Don't send password on update
      await dispatch(updateDistributor(editId, updateData));
      setEditId(null);
      setForm(emptyForm);
      setDialogOpen(false);
      setActionLoadingId(null);
      dispatch(fetchDistributors());
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this distributor?")) {
      setActionLoadingId(id);
      await dispatch(deleteDistributor(id));
      setActionLoadingId(null);
      dispatch(fetchDistributors());
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant={tab === "distributors" ? "default" : "outline"} onClick={() => setTab("distributors")}>Distributors</Button>
        <Button variant={tab === "stocks" ? "default" : "outline"} onClick={() => setTab("stocks")}>Stocks</Button>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-2 md:gap-4">
        <h1 className="text-2xl font-bold">
          {tab === "distributors" ? "Distributors" : "Stocks"}
        </h1>
        <div className="flex gap-2 items-center w-full md:w-auto">
          {tab === "distributors" && (
            <>
              <Input
                type="text"
                placeholder="Search by pincode..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-48"
              />
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  setForm(emptyForm);
                  setEditId(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditId(null); setForm(emptyForm); }}>Add Distributor</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editId ? "Edit Distributor" : "Add Distributor"}</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      editId ? handleUpdate() : handleAdd();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="name" className="mb-2">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Name"
                        value={form.name}
                        onChange={handleInput}
                        required
                      />
                    </div>
                    {!editId && (
                      <div>
                        <Label htmlFor="password" className="mb-2">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          placeholder="Password"
                          type="password"
                          value={form.password}
                          onChange={handleInput}
                          required
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="phone" className="mb-2">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={handleInput}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address" className="mb-2">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        placeholder="Address"
                        value={form.address}
                        onChange={handleInput}
                        className="h-20"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode" className="mb-2">Pincode</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        placeholder="Pincode"
                        value={form.pincode}
                        onChange={handleInput}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={!!(loading || actionLoadingId === "add" || (editId && actionLoadingId === editId))}>
                        {(loading || actionLoadingId === "add" || (editId && actionLoadingId === editId)) ? (
                          <Loader className="animate-spin mr-2" size={18} />
                        ) : null}
                        {editId ? "Update" : "Add"}
                      </Button>
                      <DialogClose asChild>
                        <Button type="button" variant="outline" onClick={() => { setEditId(null); setForm(emptyForm); }}>Cancel</Button>
                      </DialogClose>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
          {tab === "stocks" && (
            <div className="flex items-center gap-4 mb-4">
              <Input
                type="text"
                placeholder="Search by distributor..."
                value={stockSearch}
                onChange={e => setStockSearch(e.target.value)}
                className="w-64"
              />
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Companies</SelectItem>
                  <SelectItem value="NLP">NLP</SelectItem>
                  <SelectItem value="CLEANANCE">CLEANANCE</SelectItem>
                  <SelectItem value="BRM">BRM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      {tab === "distributors" ? (
        <>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="bg-white rounded shadow p-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Phone</th>
                    <th className="py-2">Address</th>
                    <th className="py-2">Pincode</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistributors && filteredDistributors.length > 0 ? (
                    filteredDistributors.map((dist: Distributor) => (
                      <tr key={dist._id} className="border-t">
                        <td className="py-2">{dist.name}</td>
                        <td className="py-2">{dist.phone}</td>
                        <td className="py-2">{dist.address}</td>
                        <td className="py-2">{dist.pincode}</td>
                        <td className="py-2 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(dist)} disabled={actionLoadingId === dist._id}>
                            {actionLoadingId === dist._id && editId === dist._id ? (
                              <Loader className="animate-spin mr-2" size={16} />
                            ) : null}
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(dist._id!)} disabled={actionLoadingId === dist._id}>
                            {actionLoadingId === dist._id ? (
                              <Loader className="animate-spin mr-2" size={16} />
                            ) : null}
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted-foreground">
                        No distributors found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}
      {tab === "stocks" && <StocksTable stockSearch={stockSearch} companyFilter={companyFilter} />}
    </div>
  );
};


const StocksTable = ({ stockSearch, companyFilter }: { stockSearch: string; companyFilter: string }) => {
  // Get stocks from Redux store
  const stocks = useSelector(selectStocks);
  // Get distributors to map IDs to names
  const distributors = useSelector(selectDistributors);
  
  // Helper function to get distributor name from ID
  const getDistributorName = (distributorId: string) => {
    if (!distributorId) return "Unknown Distributor";
    const distributor = distributors.find(d => d._id === distributorId);
    return distributor?.name || "Unknown Distributor";
  };
  
  // Filter stocks by company first if a filter is applied
  const filteredByCompany = companyFilter && companyFilter !== "ALL"
    ? stocks.filter(stock => stock.company === companyFilter)
    : stocks;
    
  // Group stocks by distributor
  const stocksByDistributor: Record<string, Stock[]> = {};
  filteredByCompany.forEach(stock => {
    if (!stocksByDistributor[stock.distributorId]) {
      stocksByDistributor[stock.distributorId] = [];
    }
    stocksByDistributor[stock.distributorId].push(stock);
  });
  
  // Filter by distributor search term
  const filteredStocks = Object.entries(stocksByDistributor).filter(([distributorId]) => {
    const distributorName = getDistributorName(distributorId);
    return stockSearch === "" || distributorName.toLowerCase().includes(stockSearch.toLowerCase());
  });

  return (
    <div className="bg-white rounded shadow p-4">
      {filteredStocks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No stocks found matching your filters.</div>
      ) : (
        <Accordion type="multiple" className="w-full">
          {filteredStocks.map(([distributorId, stocks]) => (
            <AccordionItem key={distributorId} value={distributorId}>
              <AccordionTrigger>
                <span className="text-lg font-semibold">{getDistributorName(distributorId)}</span>
              </AccordionTrigger>
              <AccordionContent>
                <table className="w-full text-left mb-4">
                  <thead>
                    <tr>
                      <th className="py-2">Product</th>
                      <th className="py-2">Company</th>
                      <th className="py-2">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map(stock => (
                      <tr key={stock._id} className="border-t">
                        <td className="py-2">{stock.name}</td>
                        <td className="py-2">{stock.company}</td>
                        <td className="py-2">{stock.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default DistributorsPage;