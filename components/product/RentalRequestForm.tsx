"use client";

import { useMemo, useState } from "react";

type RentalProduct = {
  _id: string;
  title: string;
  rentalPrice?: number;
  rentalDays?: number;
  mainImage?: string;
};

export default function RentalRequestForm({
  product,
  relatedProducts = [],
  standalone = false,
}: {
  product: RentalProduct;
  relatedProducts?: RentalProduct[];
  standalone?: boolean;
}) {
  const [open, setOpen] = useState(standalone);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [comment, setComment] = useState("");
  const departments = ["Cochabamba", "La Paz", "Santa Cruz", "Oruro", "Potosí", "Chuquisaca", "Tarija", "Beni", "Pando"];

  const selectedProducts = useMemo(
    () => relatedProducts.filter((item) => selected.includes(item._id)),
    [relatedProducts, selected]
  );
  const total = Number(product.rentalPrice || 0) + selectedProducts.reduce((sum, item) => sum + Number(item.rentalPrice || 0), 0);
  const days = Number(product.rentalDays || 1);
  const message = encodeURIComponent(
    `Hola, quiero solicitar un alquiler.%0AProducto: ${product.title}${selectedProducts.length ? `\nConjunto: ${selectedProducts.map((item) => item.title).join(", ")}` : ""}\nTotal estimado: Bs${total.toFixed(2)} por ${days} día(s).\nNombre: ${name}\nTeléfono: ${phone}\nCiudad: ${city}\nComentario: ${comment}`
  );

  return (
    <div className="mt-4">
      {!standalone && <button type="button" onClick={() => { window.location.href = `/alquiler/${product._id}`; }} className="flex h-14 w-full items-center justify-center rounded-[22px] bg-[#5661c9] px-4 text-base font-extrabold text-white transition hover:bg-[#414ba8]">Solicitar alquiler</button>}

      {open && (
        <div className="mt-3 rounded-[22px] border border-[#dfe2ff] bg-[#f5f6ff] p-4 sm:p-5">
          <p className="text-sm font-extrabold text-[#26327f]">Completa tus datos</p>
          {relatedProducts.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5661c9]">Completa el conjunto</p>
              {relatedProducts.map((item) => (
                <label key={item._id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-[#26327f]">
                  <span className="flex min-w-0 items-center gap-2"><input type="checkbox" checked={selected.includes(item._id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, item._id] : current.filter((id) => id !== item._id))} /> {item.mainImage && <img src={item.mainImage} alt="" className="h-10 w-10 rounded-lg object-cover" />} <span className="truncate">{item.title}</span></span>
                  <span className="shrink-0">Bs{Number(item.rentalPrice || 0).toFixed(2)}</span>
                </label>
              ))}
            </div>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" className="rounded-xl border border-[#dfe2ff] bg-white px-3 py-3 text-sm outline-none" />
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Tu teléfono" className="rounded-xl border border-[#dfe2ff] bg-white px-3 py-3 text-sm outline-none" />
            <select required value={city} onChange={(event) => setCity(event.target.value)} className="rounded-xl border border-[#dfe2ff] bg-white px-3 py-3 text-sm outline-none"><option value="">Selecciona tu departamento</option>{departments.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          </div>
          <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Comentario o detalle adicional" rows={4} className="mt-3 w-full rounded-xl border border-[#dfe2ff] bg-white px-3 py-3 text-sm outline-none" />
          <div className="mt-4 flex items-center justify-between gap-3 text-sm font-extrabold text-[#26327f]"><span>Total estimado</span><span>Bs{total.toFixed(2)} / {days} día(s)</span></div>
          <a href={name.trim() && phone.trim() && city ? `https://wa.me/59160769356?text=${message}` : "#datos"} onClick={(event) => { if (!name.trim() || !phone.trim() || !city) { event.preventDefault(); alert("Completa tu nombre, teléfono y departamento."); } }} target="_blank" rel="noreferrer" className="mt-4 flex h-12 items-center justify-center rounded-xl bg-[#25d366] px-4 text-sm font-extrabold text-white">Enviar solicitud por WhatsApp</a>
        </div>
      )}
    </div>
  );
}
