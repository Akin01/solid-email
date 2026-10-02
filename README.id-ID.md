<table align="center">
  <tr>
    <td valign="middle">
      <img src="assets/solid-email-logo.png" alt="Logo Solid Email" width="128" />
    </td>
    <td valign="middle">
      <h1>Solid Email</h1>
    </td>
  </tr>
</table>

<div align="center">
  Buat email HTML yang cantik dan andal dengan SolidJS.
  <br />
  Komponen berkualitas tinggi dan tanpa styling bawaan untuk template email modern.
</div>

## Pengantar

Solid Email adalah kumpulan komponen email untuk SolidJS dan TypeScript.
Dengan Solid Email, kamu bisa menulis template yang responsif menggunakan JSX yang sudah familiar, sambil tetap menghasilkan markup yang sesuai dengan ekspektasi berbagai klien email.

Terinspirasi dari [React Email](https://react.email), dirancang khusus untuk SolidJS.

## Kenapa Solid Email?

HTML untuk email itu masih penuh tantangan — perilaku tiap klien beda-beda, layout masih pakai tabel, style harus inline, dan rendering-nya sering bikin pusing.
Solid Email menjaga pengalaman menulis template tetap terasa seperti bikin aplikasi Solid biasa, tapi menghasilkan HTML yang bisa dikirim lewat provider email mana pun.

## Benchmark

Diukur menggunakan `pnpm benchmark:rendering` pada fixture marketing email di repository ini. Semakin rendah waktu rata-rata, semakin baik.

| Renderer | Template | Rata-rata v1 | Rata-rata v2 | Throughput v2 | Perbandingan (vs React Email) |
| --- | --- | ---: | ---: | ---: | --- |
| Solid Email `compileSync()` (cached) | Static JSX | 0.0438ms | **0.0386ms** | **25,927 hz** | **294x lebih cepat** |
| Solid Email `compile()` Tailwind (cached) | Tailwind JSX | 0.0452ms | **0.0506ms** | **19,773 hz** | **385x lebih cepat** |
| Solid Email `compile()` (cached) | Static JSX | 0.0858ms | **0.0520ms** | **19,240 hz** | **218x lebih cepat** |
| Solid Email `renderSync()` | Static JSX | 1.8935ms | **1.2689ms** | **788.08 hz** | **8,95x lebih cepat** |
| Solid Email `render()` | Static JSX | 2.2919ms | **1.9760ms** | **506.06 hz** | **5,75x lebih cepat** |
| Solid Email `render()` | Tailwind JSX | 3.1230ms | **2.4926ms** | **401.19 hz** | **7,82x lebih cepat** |
| React Email `render()` | Static JSX | 11.5084ms | 10.2234ms | 97.81 hz | Baseline |
| React Email `render()` | Tailwind JSX | 17.7760ms | 16.8971ms | 59.18 hz | Baseline Tailwind |

**Cached** artinya template di-compile satu kali, lalu yang diukur hanya langkah render-nya saja. Ini adalah pola penggunaan yang umum di production — compile saat module di-load, render setiap ada request. Biaya compile+render sekali jalan kurang lebih setara dengan memanggil `render()` langsung.

Benchmark plain-text diukur menggunakan `pnpm benchmark:html-to-text` pada fixture HTML-to-text di repository ini. Semakin rendah waktu rata-rata, semakin baik.

| Operasi | Fixture | Rata-rata v1 | Rata-rata v2 | Throughput v2 | Perbandingan (vs React Email) |
| --- | --- | ---: | ---: | ---: | --- |
| `@solid-email/render` `toPlainText` | HTML fixtures | 2.4369ms | **1.7383ms** | **575.29 hz** | **3,58x lebih cepat** |
| `@solid-email/render` compiled text template | Solid JSX | 1.4434ms | **0.2913ms** | **3,432.87 hz** | **189x lebih cepat** |
| `@solid-email/render` uncompiled `renderSync` | Solid JSX | 2.8895ms | **3.3323ms** | **300.10 hz** | **3,48x lebih cepat** |
| `@solid-email/html-to-text` `convert` | HTML fixtures | 3.9657ms | **1.6586ms** | **602.91 hz** | **5,56x lebih cepat** |
| `html-to-text` `convert` | HTML fixtures | 3.8166ms | 3.6168ms | 276.48 hz | Baseline converter langsung |
| React Email `toPlainText` | HTML fixtures | 8.2867ms | 6.2313ms | 160.48 hz | Baseline konversi teks React |
| React Email `render` plain text | React JSX | 12.4310ms | 10.7571ms | 92.96 hz | Baseline plain-text render React |

Benchmark lintas library diukur menggunakan `pnpm benchmark:cross-library` pada
template marketing email, dengan 50 iterasi × 10 run setelah 3 warmup run.
Semakin rendah waktu rata-rata, semakin baik.

| Library / mode | Avg v1 | Avg v2 | Min | Max | Ops/s | Output | Heap Δ | Conformance | vs React Email |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Solid Email `compileSync` render (cached) | 12µs | **20µs** | **17µs** | **27µs** | **49,108** | 23.2 KB | **0.50 MB** | 100% | **125,8x lebih cepat** |
| Solid Email `renderSync` | 1.17ms | **645µs** | **501µs** | **897µs** | **1,551** | 22.4 KB | **0.56 MB** | 100% | **4,0x lebih cepat** |
| React Email `render` | 1.78ms | 3.31ms | 1.84ms | 7.99ms | 302 | 22.3 KB | 26.51 MB | 100% | Baseline |
| JSX Email `render` | 3.82ms | 5.13ms | 4.43ms | 7.18ms | 195 | **18.2 KB** | 1.38 MB | 100% | 1,5x lebih lambat |
| MJML React `render` | 11.01ms | 11.84ms | 10.16ms | 14.80ms | 84 | 75.5 KB | 1.65 MB | 100% | 3,6x lebih lambat |

Semua output lintas library mencapai 100% pairwise conformance terhadap pengecekan template email bersama.

Perbandingan ukuran bundle diambil dari file ESM entry yang sudah di-build setelah `pnpm build`; gzip menggunakan `zlib.gzipSync` dari Node.

| Package entry | v1 Raw (Gzip) | v2 Raw (Gzip) | Perbandingan |
| --- | ---: | ---: | --- |
| `@solid-email/render/dist/node/index.mjs` | 26.3 KiB (6.2 KiB) | **26.7 KiB (6.2 KiB)** | Entry renderer khusus node/server |
| `@akin01/solid-email/dist/client/index.mjs` | 105.9 KiB (19.5 KiB) | 106.3 KiB (19.5 KiB) | Build preview DOM/CSR untuk kondisi browser |
| `@akin01/solid-email/dist/index.mjs` | 199.0 KiB (42.7 KiB) | 203.0 KiB (43.3 KiB) | Komponen server/root dan re-export utilitas render |
| `@solid-email/render/dist/browser/index.mjs` | — | 197.4 KiB (45.2 KiB) | Entry renderer standalone untuk browser (baru di v2) |
| Entry server Solid Email | 225.3 KiB (48.9 KiB) | 229.7 KiB (49.5 KiB) | **4,8x lebih kecil raw / 6,8x lebih kecil gzip dari React Email** |
| Total distribusi `react-email` | 1,448.0 KiB (348.6 KiB) | 1,110.0 KiB (334.7 KiB) | Baseline React Email |

## Instalasi

```sh
pnpm add @akin01/solid-email @solid-email/render solid-js @solidjs/web
```

## Mulai Menggunakan

Definisikan template email menggunakan komponen SolidJS.

```tsx
import { Body, Button, Container, Html, Text } from '@akin01/solid-email';

export function WelcomeEmail() {
  return (
    <Html>
      <Body>
        <Container>
           <Text>Selamat datang di Solid Email.</Text>
           <Button href="https://example.com">Mulai</Button>
        </Container>
      </Body>
    </Html>
  );
}
```

Render template menjadi HTML sebelum dikirim.

```tsx
import { render } from '@solid-email/render';
import { WelcomeEmail } from './welcome-email';

const html = await render(() => <WelcomeEmail />);
```

Untuk template statis yang tidak menggunakan async resource atau formatting khusus, kamu bisa pakai renderer yang sinkron.

```tsx
import { renderSync } from '@solid-email/render';
import { WelcomeEmail } from './welcome-email';

const html = renderSync(() => <WelcomeEmail />);
```

## Entrypoint

`@akin01/solid-email` di-export secara kondisional. Import dari Server, Workerd,
dan default akan mengekspos `render`, `compile`, serta seluruh set komponen email
termasuk `Tailwind`.

Import dengan kondisi browser dari package root yang sama akan mengarah ke
build preview DOM/CSR. Build ini mengekspos komponen preview yang aman untuk DOM
dan secara sengaja tidak menyertakan `render`, `compile`, dan `Tailwind`.

## Compile untuk Render Berulang

Kalau kamu perlu me-render template yang sama berkali-kali dengan data berbeda, `compile()` akan mengevaluasi komponen Solid satu kali dan menggunakan ulang HTML yang sudah di-cache di setiap render berikutnya.

```tsx
import { compile, Slot, slot } from '@solid-email/render';
import { Html, Body, Container, Text } from '@akin01/solid-email';

function WelcomeEmail() {
  return (
    <Html>
      <Body>
        <Container>
          <Text>
            Halo <Slot name="name" />!
          </Text>
          <a href={slot('url')}>Kunjungi</a>
        </Container>
      </Body>
    </Html>
  );
}

const compiled = await compile(() => <WelcomeEmail />);

const html = await compiled.render({ name: 'Alice', url: 'https://example.com' });
const html2 = await compiled.render({ name: 'Bob', url: 'https://other.com' });
```

Gunakan `compileSync()` untuk versi sinkronnya (tidak mendukung output `pretty`).

### Compile Output Plain-Text

Untuk kebutuhan plain-text berulang, compile template dengan opsi `withPlainText: true`. Template yang sudah di-compile akan menyimpan representasi teks yang bisa dipakai ulang, jadi setiap render hanya perlu mengganti nilai slot-nya saja.

```tsx
import { Body, Button, Container, Html, Text } from '@akin01/solid-email';
import { compile, Slot, slot } from '@solid-email/render';

const compiled = await compile(
  <Html>
    <Body>
      <Container>
        <Text>
          Halo <Slot name="name" />!
        </Text>
        <Button href={slot('url')}>Buka dashboard</Button>
      </Container>
    </Body>
  </Html>,
  { withPlainText: true },
);

const text = await compiled.render(
  { name: 'Alice', url: 'https://example.com/dashboard' },
  { plainText: true },
);
```

Untuk konversi Solid JSX ke plain-text yang sifatnya sekali pakai, render template dengan opsi `plainText: true`.

```tsx
import { Body, Button, Container, Html, Text } from '@akin01/solid-email';
import { render } from '@solid-email/render';

const text = await render(
  () => (
    <Html>
      <Body>
        <Container>
          <Text>Halo Alice</Text>
          <Button href="https://example.com/dashboard">Buka dashboard</Button>
        </Container>
      </Body>
    </Html>
  ),
  { plainText: true },
);
```

### Slot

Slot menandai bagian-bagian dinamis dari template yang sudah di-compile.

| API | Kegunaan |
| --- | --- |
| `<Slot name="..." />` | Slot konten di dalam elemen JSX. |
| `slot("...")` | Slot atribut untuk nilai atribut seperti `href` atau `src`. |
| `defineSlots<T>()` | Nama slot dengan tipe kuat untuk autocomplete di editor. |
| `CompiledTemplate.render(data)` | Render ulang template dengan nilai slot baru. |
| `CompiledTemplate.renderSync(data)` | Render ulang secara sinkron (tanpa `pretty`). |

Slot konten menerima string, number, boolean, null, undefined, JSX, dan array.
Slot atribut hanya menerima string, number, boolean, null, dan undefined; kalau
kamu memasukkan JSX, object, atau array ke slot atribut, akan langsung error
supaya link dan gambar yang rusak tidak lolos ke production. Gunakan `<Slot name="..." />` untuk nilai JSX/konten.

#### Tipe lemah (slot tanpa tipe)

Nama slot berupa string biasa — cepat ditulis tapi tidak ada pengecekan saat compile.

```tsx
import { compile, Slot, slot } from '@solid-email/render';

const compiled = await compile(
  <p>
    Halo <Slot name="name" />!
  </p>
);

// Nama slot berupa string, typo tidak terdeteksi
const html = await compiled.render({ name: 'Alice' });
```

#### Tipe kuat (defineSlots)

`defineSlots<T>()` mengembalikan fungsi accessor yang sudah memiliki tipe, jadi typo dan key yang hilang langsung ketahuan saat compile.

```tsx
import { compile, defineSlots } from '@solid-email/render';

type MySlots = {
  name: string;
  url: string;
};

const slots = defineSlots<MySlots>();

const compiled = await compile<MySlots>(
  <p>
    Halo {slots.content('name')}!
    <a href={slots.attr('url')}>Kunjungi</a>
  </p>,
);

// TypeScript akan error kalau ada key yang kurang atau nama yang salah ketik
const html = await compiled.render({ name: 'Alice', url: 'https://example.com' });
```

Slot konten mendukung nilai default lewat argumen kedua: `slots.content('name', 'Guest')`.

#### Slot sebagai Props

Kamu bisa melewatkan marker slot lewat props komponen saat mengadaptasi komponen
yang sudah prop-driven. Props yang diberikan ke `compile()` adalah nilai saat
compile, jadi gunakan `<Slot />` atau `slot()` sebagai nilai prop untuk data
yang berubah di setiap render.

```tsx
import type { JSX } from 'solid-js';
import { compile, Slot, slot } from '@solid-email/render';

function Button(props: { href: string; children: JSX.Element }) {
  return <a href={props.href}>{props.children}</a>;
}

function WelcomeEmail(props: { name: JSX.Element; actionUrl: string }) {
  return (
    <p>
      Halo {props.name}! <Button href={props.actionUrl}>Buka dashboard</Button>
    </p>
  );
}

const compiled = await compile(
  <WelcomeEmail name={<Slot name="name" />} actionUrl={slot('url')} />,
);

const html = await compiled.render({
  name: 'Alice',
  url: 'https://example.com/dashboard',
});
```

### Tailwind dengan Template yang Di-compile

Class Tailwind harus ada di elemen parent yang statis, bukan di komponen Slot. Nilai slot saat runtime menggunakan inline style atau bisa juga fallback ke `render()`.

## Komponen

Sekumpulan komponen standar untuk membangun layout email tanpa harus menulis setiap tabel dan style yang aman untuk klien email secara manual.

- [Html](packages/solid-email/src/components/html)
- [Head](packages/solid-email/src/components/head)
- [Font](packages/solid-email/src/components/font)
- [Preview](packages/solid-email/src/components/preview)
- [Body](packages/solid-email/src/components/body)
- [Container](packages/solid-email/src/components/container)
- [Section](packages/solid-email/src/components/section)
- [Row](packages/solid-email/src/components/row)
- [Column](packages/solid-email/src/components/column)
- [Heading](packages/solid-email/src/components/heading)
- [Text](packages/solid-email/src/components/text)
- [Hr](packages/solid-email/src/components/hr)
- [Img](packages/solid-email/src/components/img)
- [Link](packages/solid-email/src/components/link)
- [Button](packages/solid-email/src/components/button)
- [CodeInline](packages/solid-email/src/components/code-inline)
- [CodeBlock](packages/solid-email/src/components/code-block)
- [Markdown](packages/solid-email/src/components/markdown)
- [Tailwind](packages/solid-email/src/components/tailwind)

## Mengirim Email

Renderer menghasilkan HTML biasa, jadi template bisa dikirim lewat provider mana pun yang menerima body HTML.

```tsx
const html = await render(() => <WelcomeEmail />);

await emailProvider.send({
  to: 'user@example.com',
  subject: 'Welcome',
  html,
});
```

## Dukungan Klien Email

Solid Email menargetkan batasan HTML dan CSS umum yang digunakan oleh klien email populer.
Selalu preview template penting di klien email yang dipakai audiensmu.

| <img src="https://react.email/static/icons/gmail.svg" width="48" height="48" alt="Logo Gmail" /> | <img src="https://react.email/static/icons/apple-mail.svg" width="48" height="48" alt="Logo Apple Mail" /> | <img src="https://react.email/static/icons/outlook.svg" width="48" height="48" alt="Logo Outlook" /> | <img src="https://react.email/static/icons/yahoo-mail.svg" width="48" height="48" alt="Logo Yahoo Mail" /> | <img src="https://react.email/static/icons/hey.svg" width="48" height="48" alt="Logo HEY" /> | <img src="https://react.email/static/icons/superhuman.svg" width="48" height="48" alt="Logo Superhuman" /> |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Gmail ✔ | Apple Mail ✔ | Outlook ✔ | Yahoo Mail ✔ | HEY ✔ | Superhuman ✔ |

## Agent Skill

Solid Email menyertakan agent skill untuk panduan pembuatan template, rendering, styling, dan testing.

```sh
npx skills add akin01/solid-email@solid-email
```

Sumber skill-nya ada di [`skills/solid-email`](skills/solid-email).

## Development

Repository ini menggunakan pnpm workspaces dan Biome.

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm lint
```

---

<div align="center">
  Dibuat dengan ❤️ Lisensi MIT.
</div>
