import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

const supabaseUrl = 'https://erjlwljdgkhqdkizjlzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyamx3bGpkZ2tocWRraXpqbHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODg2ODQsImV4cCI6MjA5Mzg2NDY4NH0.4oJbq-BacA8rPCmqtH0vyxW3dlcCSCFaCzezmQUoggc';

const supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'barcode' } });
const userId = '36985b23-4774-4e69-9a39-c207bc87a526';

const items = [
  { title: "Cali 2761 GMT", url: "https://chronologie-manual-book.vercel.app/m/00c48pqk" },
  { title: "Cali 2765 GMT Worldtimer", url: "https://chronologie-manual-book.vercel.app/m/k3b3ispd" },
  { title: "Cali 2766-2", url: "https://chronologie-manual-book.vercel.app/m/k2ftacto" },
  { title: "Cali 2880", url: "https://chronologie-manual-book.vercel.app/m/vou6k9el" },
  { title: "Cali 2945-2145 Moonphase", url: "https://chronologie-manual-book.vercel.app/m/rywfdpfw" },
  { title: "Cali 7741 Chrono", url: "https://chronologie-manual-book.vercel.app/m/ezl0omux" },
  { title: "Cali 7754", url: "https://chronologie-manual-book.vercel.app/m/kefjujfm" },
  { title: "Cali 7780 Chrono", url: "https://chronologie-manual-book.vercel.app/m/slxppehx" },
  { title: "Cali 7783 Flyback", url: "https://chronologie-manual-book.vercel.app/m/itikmz_1" },
  { title: "Cali Mech Auto with Date Hand and Moonphase", url: "https://chronologie-manual-book.vercel.app/m/r9npyn8l" },
  { title: "Cali Mech Auto with Date", url: "https://chronologie-manual-book.vercel.app/m/um-6dxdm" },
  { title: "Cali Mech Auto with DayDateWeekMonth Moonphase", url: "https://chronologie-manual-book.vercel.app/m/95zh-xnj" },
  { title: "Cali Mech Auto with Moonphase Date", url: "https://chronologie-manual-book.vercel.app/m/rmjgznb3" },
  { title: "Cali Mech Automatic", url: "https://chronologie-manual-book.vercel.app/m/zwsvw3cg" },
  { title: "Cali Mech Small Seconds", url: "https://chronologie-manual-book.vercel.app/m/mpdwheyp" },
  { title: "Cali Quartz 2", url: "https://chronologie-manual-book.vercel.app/m/ijimppgl" },
  { title: "Cali Quartz Shine", url: "https://chronologie-manual-book.vercel.app/m/hmhyjahu" }
];

async function run() {
  const payloads = items.map(item => ({
    short_id: nanoid(6),
    type: 'link',
    first_name: item.title,
    user_id: userId,
    raw_data: { content: item.url },
    dots_color: '#000000',
    background_color: '#ffffff',
    dots_type: 'rounded',
    corners_square_type: 'extra-rounded',
    corners_dot_type: 'dot'
  }));

  const { data, error } = await supabase
    .from('dynamic_links')
    .insert(payloads)
    .select();

  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Successfully inserted QRs:");
    data.forEach(d => {
      console.log(`- ${d.first_name} 👉 https://bikinqr.vercel.app/v/${d.short_id}`);
    });
  }
}

run();
