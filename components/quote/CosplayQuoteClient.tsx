"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiCheck, FiExternalLink, FiMessageCircle, FiPackage, FiSearch, FiTruck } from "react-icons/fi";

type Store = {
  name: string;
  domain: string;
  description: string;
  quality: string[];
  note: string;
};

const stores: Store[] = [
  { name: "DokiDoki Cosplay", domain: "dokidokicos.com", description: "Cosplays por niveles de acabado.", quality: ["N", "S", "SR", "SSR"], note: "Los niveles dependen del modelo disponible." },
  { name: "Uwowo", domain: "uwowocosplay.com", description: "Cosplays, pelucas y accesorios licenciados o temáticos.", quality: ["Catálogo propio"], note: "La calidad varía según cada producto." },
  { name: "Miccostumes", domain: "miccostumes.com", description: "Disfraces, cosplay y complementos variados.", quality: ["Catálogo propio"], note: "Revisamos fotos y descripción antes de cotizar." },
  { name: "WakuWaku", domain: "wakuwakucosplay.com", description: "Prendas y accesorios para distintos personajes.", quality: ["Catálogo propio"], note: "Consulta disponibilidad antes de pedir." },
  { name: "RoleCosplay", domain: "rolecosplay.com", description: "Cosplays y piezas para armar conjuntos.", quality: ["Catálogo propio"], note: "El acabado depende de cada publicación." },
  { name: "AliExpress / Temu", domain: "aliexpress.com", description: "Opciones amplias según vendedor y presupuesto.", quality: ["Variable"], note: "Se revisa reputación, fotos y reseñas del vendedor." },
];

const departments = ["Cochabamba", "La Paz", "Santa Cruz", "Chuquisaca", "Oruro", "Potosí", "Tarija", "Beni", "Pando"];

function QualityGuide() {
  return (
    <section className="mt-8 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_10px_28px_var(--shadow)] sm:p-7">
      <span className="rounded-full bg-[var(--surface-soft)] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--primary)]">Guía de calidad</span>
      <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">¿Qué significan N, S, SR y SSR?</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-soft)] sm:text-base">Son rangos que algunas tiendas, como DokiDoki, usan para diferenciar materiales y detalle. No todas las tiendas usan esta clasificación.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["N", "Básico", "Opción más simple para presupuesto ajustado."],
          ["S", "Estándar", "Mejor equilibrio entre precio y acabado."],
          ["SR", "Premium", "Más detalle, materiales y terminaciones."],
          ["SSR", "Superior", "Nivel más alto disponible en modelos seleccionados."],
        ].map(([rank, title, text]) => <div key={rank} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4"><span className="text-xl font-black text-[var(--primary)]">{rank}</span><h3 className="mt-2 font-extrabold">{title}</h3><p className="mt-1 text-xs leading-5 text-[var(--text-soft)]">{text}</p></div>)}
      </div>
    </section>
  );
}

export default function CosplayQuoteClient() {
  const [store, setStore] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const department = String(form.get("department") || "").trim();
    const item = String(form.get("item") || "").trim();

    if (!name || !phone || !department || !item) {
      setError("Completa tu nombre, teléfono, departamento y lo que deseas cotizar.");
      return;
    }

    const message = encodeURIComponent([
      "Hola, quiero cotizar una importación de cosplay.",
      "",
      `Nombre: ${name}`,
      `Teléfono: ${phone}`,
      `Tienda: ${store || "No especificada"}`,
      `Producto o personaje: ${item}`,
      `Enlace: ${String(form.get("link") || "Sin enlace").trim() || "Sin enlace"}`,
      `Incluye: ${String(form.get("parts") || "No especificado")}`,
      `Talla: ${String(form.get("size") || "No especificada")}`,
      `Departamento: ${department}`,
      `Comentario: ${String(form.get("comment") || "Sin comentario")}`,
      "",
      "Entiendo que esta solicitud es una cotización y no confirma una compra.",
    ].join("\n"));

    window.open(`https://wa.me/59160769356?text=${message}`, "_blank", "noopener,noreferrer");
    setError("");
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="mx-auto w-full max-w-[1380px] px-4 pb-12 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-extrabold text-[var(--text)] transition hover:text-[var(--primary)]"><FiArrowLeft /> Volver al inicio</Link>
        <div className="mt-5 rounded-[30px] border border-[var(--border)] bg-[var(--surface)] px-5 py-7 shadow-[0_12px_30px_var(--shadow)] sm:px-9 sm:py-9">
          <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--primary)]">Importación personalizada</span>
          <h1 className="mt-3 max-w-3xl text-[2.25rem] font-extrabold leading-tight sm:text-5xl">Cotiza tu cosplay ideal</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-soft)] sm:text-base">Envíanos un enlace o dinos qué personaje buscas. Revisamos opciones de importación y te respondemos por WhatsApp.</p>
          <a href="#formulario-cotizacion" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[var(--primary-dark)]"><FiMessageCircle /> Ir al formulario</a>
        </div>

        <section className="mt-8">
          <div><span className="rounded-full bg-[var(--surface)] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--primary)] shadow-sm">Tiendas disponibles</span><h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">Podemos revisar productos de estas tiendas</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-soft)] sm:text-base">Elige una tienda para tu solicitud. La disponibilidad, precio final y tiempo de llegada se revisan antes de confirmar.</p></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stores.map((item) => <button key={item.name} type="button" onClick={() => setStore(item.name)} className={`rounded-[24px] border p-5 text-left shadow-sm transition hover:-translate-y-1 ${store === item.name ? "border-[var(--primary)] bg-[var(--surface-soft)] ring-2 ring-[var(--primary-light)]/30" : "border-[var(--border)] bg-[var(--surface)]"}`}><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><img src={`https://www.google.com/s2/favicons?domain=${item.domain}&sz=128`} alt="" className="h-10 w-10 shrink-0 rounded-xl border border-[var(--border-soft)] bg-white p-1.5" /><h3 className="text-lg font-extrabold">{item.name}</h3></div>{store === item.name && <FiCheck className="shrink-0 text-xl text-[var(--primary)]" />}</div><p className="mt-3 min-h-[44px] text-sm leading-6 text-[var(--text-soft)]">{item.description}</p><div className="mt-4 flex flex-wrap gap-2">{item.quality.map((quality) => <span key={quality} className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-extrabold text-[var(--primary)]">{quality}</span>)}</div><p className="mt-3 text-xs font-semibold text-[var(--text-muted)]">{item.note}</p></button>)}
          </div>
        </section>

        <QualityGuide />

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form id="formulario-cotizacion" onSubmit={submit} className="scroll-mt-6 rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_30px_var(--shadow)] sm:p-7">
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]"><FiSearch className="text-xl" /></span><div><h2 className="text-2xl font-extrabold">Solicita una cotización</h2><p className="text-sm text-[var(--text-soft)]">Completa los detalles y abre WhatsApp con el mensaje listo.</p></div></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-extrabold">Nombre completo<input name="name" className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 font-medium outline-none focus:border-[var(--primary)]" placeholder="Tu nombre" /></label>
              <label className="text-sm font-extrabold">Teléfono<input name="phone" inputMode="tel" className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 font-medium outline-none focus:border-[var(--primary)]" placeholder="7xxxxxxx" /></label>
              <label className="text-sm font-extrabold sm:col-span-2">Personaje o producto que buscas<input name="item" className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 font-medium outline-none focus:border-[var(--primary)]" placeholder="Ej. Furina, cosplay completo" /></label>
              <label className="text-sm font-extrabold sm:col-span-2">Enlace del producto <span className="font-medium text-[var(--text-muted)]">(opcional)</span><input name="link" type="url" className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 font-medium outline-none focus:border-[var(--primary)]" placeholder="https://..." /></label>
              <label className="text-sm font-extrabold sm:col-span-2">Tienda <span className="font-medium text-[var(--text-muted)]">(opcional)</span><select value={store} onChange={(event) => setStore(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 font-medium"><option value="">No especificada</option>{stores.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
              <label className="text-sm font-extrabold">¿Qué necesitas?<select name="parts" className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 font-medium"><option>Cosplay completo</option><option>Solo cosplay</option><option>Peluca</option><option>Zapatos</option><option>Accesorios</option><option>Conjunto completo</option></select></label>
              <label className="text-sm font-extrabold">Talla <input name="size" className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 font-medium" placeholder="Ej. M / medidas" /></label>
              <label className="text-sm font-extrabold sm:col-span-2">Departamento<select name="department" defaultValue="Cochabamba" className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 font-medium">{departments.map((department) => <option key={department}>{department}</option>)}</select></label>
              <label className="text-sm font-extrabold sm:col-span-2">Comentario <span className="font-medium text-[var(--text-muted)]">(opcional)</span><textarea name="comment" rows={4} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 font-medium outline-none focus:border-[var(--primary)]" placeholder="Color, fecha en la que lo necesitas, enlace de referencia u otro detalle..." /></label>
            </div>
            {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
            <button type="submit" className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#25d366] px-5 text-sm font-extrabold text-white transition hover:brightness-95"><FiMessageCircle className="text-lg" /> Enviar cotización por WhatsApp</button>
          </form>
          <aside className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_30px_var(--shadow)] sm:p-7"><h2 className="text-2xl font-extrabold">¿Cómo funciona?</h2><div className="mt-6 space-y-5">{[[FiSearch, "1. Comparte el producto", "Elige una tienda y pega el enlace o describe el personaje."], [FiPackage, "2. Revisamos la opción", "Comprobamos disponibilidad, talla, calidad y detalles del producto."], [FiTruck, "3. Recibes la cotización", "Te respondemos por WhatsApp con el proceso y el monto estimado."]].map(([Icon, title, text], index) => { const StepIcon = Icon as typeof FiSearch; return <div key={title as string} className="flex gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] font-extrabold text-[var(--primary)]">{index + 1}</span><div><h3 className="font-extrabold">{title as string}</h3><p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">{text as string}</p></div></div>})}</div><div className="mt-7 rounded-2xl bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--text-soft)]"><strong className="text-[var(--text)]">Importante:</strong> el precio y tiempo final dependen del producto, peso, envío internacional y tipo de cambio. La cotización no reserva ni confirma una compra.</div><a href="https://wa.me/59160769356?text=Hola%2C%20quiero%20consultar%20sobre%20una%20importaci%C3%B3n%20de%20cosplay." target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--primary)] hover:underline"><FiExternalLink /> Consultar por WhatsApp</a></aside>
        </section>
      </section>
    </main>
  );
}
