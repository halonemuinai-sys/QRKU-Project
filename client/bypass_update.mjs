import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://erjlwljdgkhqdkizjlzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyamx3bGpkZ2tocWRraXpqbHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODg2ODQsImV4cCI6MjA5Mzg2NDY4NH0.4oJbq-BacA8rPCmqtH0vyxW3dlcCSCFaCzezmQUoggc';

const supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'barcode' } });
const userId = '36985b23-4774-4e69-9a39-c207bc87a526';

const updates = [
  { title: "Cali 2761 GMT", url: "https://chronologie-manual-book.vercel.app/cali-2761-gmt" },
  { title: "Cali 2765 GMT Worldtimer", url: "https://chronologie-manual-book.vercel.app/cali-2765-gmt-worldtimer" },
  { title: "Cali 2766-2", url: "https://chronologie-manual-book.vercel.app/cali-2766-2" },
  { title: "Cali 2880", url: "https://chronologie-manual-book.vercel.app/cali-2880" },
  { title: "Cali 2945-2145 Moonphase", url: "https://chronologie-manual-book.vercel.app/cali-2945-2145-moonphase" },
  { title: "Cali 7741 Chrono", url: "https://chronologie-manual-book.vercel.app/cali-7741-chrono" },
  { title: "Cali 7754", url: "https://chronologie-manual-book.vercel.app/cali-7754" },
  { title: "Cali 7780 Chrono", url: "https://chronologie-manual-book.vercel.app/cali-7780-chrono" },
  { title: "Cali 7783 Flyback", url: "https://chronologie-manual-book.vercel.app/cali-7783-flyback" },
  { title: "Cali Mech Auto with Date Hand and Moonphase", url: "https://chronologie-manual-book.vercel.app/cali-mech-auto-with-date-hand-and-moonphase" },
  { title: "Cali Mech Auto with Date", url: "https://chronologie-manual-book.vercel.app/cali-mech-auto-with-date" },
  { title: "Cali Mech Auto with DayDateWeekMonth Moonphase", url: "https://chronologie-manual-book.vercel.app/cali-mech-auto-with-daydateweekmonth-moonphase" },
  { title: "Cali Mech Auto with Moonphase Date", url: "https://chronologie-manual-book.vercel.app/cali-mech-auto-with-moonphase-date" },
  { title: "Cali Mech Automatic", url: "https://chronologie-manual-book.vercel.app/cali-mech-automatic" },
  { title: "Cali Mech Small Seconds", url: "https://chronologie-manual-book.vercel.app/cali-mech-small-seconds" },
  { title: "Cali Quartz 2", url: "https://chronologie-manual-book.vercel.app/cali-quartz-2" },
  { title: "Cali Quartz Shine", url: "https://chronologie-manual-book.vercel.app/cali-quartz-shine" }
];

async function run() {
  let updatedCount = 0;
  for (const item of updates) {
    const { data, error } = await supabase
      .from('dynamic_links')
      .update({ raw_data: { content: item.url } })
      .eq('first_name', item.title)
      .eq('user_id', userId)
      .select('short_id');

    if (error) {
      console.error(`Error updating ${item.title}:`, error);
    } else {
      updatedCount++;
      if (data && data.length > 0) {
        console.log(`Updated ${item.title} -> https://bikinqr.vercel.app/v/${data[0].short_id} (redirects to ${item.url})`);
      }
    }
  }
  console.log(`\nFinished updating ${updatedCount}/${updates.length} records.`);
}

run();
