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

| Renderer | Template | Rata-rata | Throughput | Perbandingan |
| --- | --- | ---: | ---: | --- |
| Solid Email `render()` | Static JSX | 2.2919ms | 436.33 hz | 5,02x lebih cepat dari React Email `render()` |
| Solid Email `renderSync()` | Static JSX | 1.8935ms | 528.13 hz | 6,08x lebih cepat dari React Email `render()` |
| Solid Email `render()` | Tailwind JSX | 3.1230ms | 320.20 hz | 5,69x lebih cepat dari React Email Tailwind |
| Solid Email `compileSync()` render (cached) | Static JSX | **0.0438ms** | **22,842 hz** | 263x lebih cepat dari React Email `render()` |
 | Solid Email `compile()` render (cached) | Static JSX | 0.0858ms | 11,661 hz | 134x lebih cepat dari React Email `render()` |
 | Solid Email `compile()` render (cached) | Tailwind JSX | 0.0452ms | 22,145 hz | **393x lebih cepat dari React Email Tailwind** |
| React Email `render()` | Static JSX | 11.5084ms | 86.89 hz | Baseline |
| React Email `render()` | Tailwind JSX | 17.7760ms | 56.26 hz | Baseline Tailwind |

**Cached** artinya template di-compile satu kali, lalu yang diukur hanya langkah render-nya saja. Ini adalah pola penggunaan yang umum di production — compile saat module di-load, render setiap ada request. Biaya compile+render sekali jalan kurang lebih setara dengan memanggil `render()` langsung.

Benchmark plain-text diukur menggunakan `pnpm benchmark:html-to-text` pada fixture HTML-to-text di repository ini. Semakin rendah waktu rata-rata, semakin baik.

| Operasi | Fixture | Rata-rata | Throughput | Perbandingan |
| --- | --- | ---: | ---: | --- |
| `@solid-email/render` `toPlainText` | HTML fixtures | 2.4369ms | 410.36 hz | 3,40x lebih cepat dari React Email `toPlainText` |
| `@solid-email/render` compiled text template | Solid JSX | **1.4434ms** | **692.83 hz** | **8,61x lebih cepat dari React Email plain-text render** |
| `@solid-email/render` uncompiled `renderSync` plain text | Solid JSX | 2.8895ms | 346.09 hz | 4,30x lebih cepat dari React Email plain-text render |
| `@solid-email/html-to-text` `convert` | HTML fixtures | 3.9657ms | 252.16 hz | Converter langsung dari package |
| `html-to-text` `convert` | HTML fixtures | 3.8166ms | 262.01 hz | Baseline converter langsung |
| React Email `toPlainText` | HTML fixtures | 8.2867ms | 120.67 hz | Baseline konversi teks React |
| React Email `render` plain text | React JSX | 12.4310ms | 80.44 hz | Baseline plain-text render React |

Benchmark lintas library diukur menggunakan `pnpm benchmark:cross-library` pada
template marketing email, dengan 50 iterasi × 10 run setelah 3 warmup run.
Semakin rendah waktu rata-rata, semakin baik.

| Library / mode | Avg | Min | Max | Ops/s | Output | Heap Δ | Conformance | vs React Email |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Solid Email `renderSync` | 1.17ms | 764µs | 1.47ms | 853 | 22.6 KB | **<0.01 MB** | 100% | 1,5x lebih cepat |
| Solid Email `compileSync` render (cached) | **12µs** | **9µs** | **15µs** | **83,483** | 23.4 KB | **<0.01 MB** | 100% | **148,4x lebih cepat** |
| JSX Email `render` | 3.82ms | 3.25ms | 5.45ms | 262 | **18.2 KB** | 1.15 MB | 100% | 2,1x lebih lambat |
| React Email `render` | 1.78ms | 1.37ms | 4.00ms | 563 | 22.5 KB | 26.36 MB | 100% | Baseline |
| MJML React `render` | 11.01ms | 9.39ms | 14.74ms | 91 | 75.5 KB | 1.57 MB | 100% | 6,2x lebih lambat |

Semua output lintas library mencapai 100% pairwise conformance terhadap pengecekan template email bersama.

Perbandingan ukuran bundle diambil dari file ESM entry yang sudah di-build setelah `pnpm build`; gzip menggunakan `zlib.gzipSync` dari Node.

| Package entry | Ukuran raw | Ukuran gzip | Perbandingan |
| --- | ---: | ---: | --- |
| `@akin01/solid-email/dist/index.mjs` | 199.0 KiB | 42.7 KiB | Komponen server/root dan re-export utilitas render |
| `@akin01/solid-email/dist/client/index.mjs` | 105.9 KiB | 19.5 KiB | Build preview DOM/CSR untuk kondisi browser |
| `@solid-email/render/dist/node/index.mjs` | **26.3 KiB** | **6.2 KiB** | Entry renderer |
| Entry server Solid Email | 225.3 KiB | 48.9 KiB | **6,4x lebih kecil raw / 7,1x lebih kecil gzip dari React Email** |
| Semua entry kondisi ESM Solid Email | 331.2 KiB | 68.4 KiB | 4,4x lebih kecil raw / 5,1x lebih kecil gzip dari React Email |
| `react-email/dist/index.mjs` | 1,448.0 KiB | 348.6 KiB | Baseline React Email |

## Instalasi

```sh
pnpm add @akin01/solid-email @solid-email/render solid-js
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
  Dibuat dengan ❤️, Lisensi MIT.
</div>
