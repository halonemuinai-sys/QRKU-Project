import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://erjlwljdgkhqdkizjlzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyamx3bGpkZ2tocWRraXpqbHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODg2ODQsImV4cCI6MjA5Mzg2NDY4NH0.4oJbq-BacA8rPCmqtH0vyxW3dlcCSCFaCzezmQUoggc';

const supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'barcode' } });
const userId = '36985b23-4774-4e69-9a39-c207bc87a526';
const logoUrl = 'https://bikinqr.vercel.app/logo-chronologie.png';

const items = [
  "Cali 2761 GMT",
  "Cali 2765 GMT Worldtimer",
  "Cali 2766-2",
  "Cali 2880",
  "Cali 2945-2145 Moonphase",
  "Cali 7741 Chrono",
  "Cali 7754",
  "Cali 7780 Chrono",
  "Cali 7783 Flyback",
  "Cali Mech Auto with Date Hand and Moonphase",
  "Cali Mech Auto with Date",
  "Cali Mech Auto with DayDateWeekMonth Moonphase",
  "Cali Mech Auto with Moonphase Date",
  "Cali Mech Automatic",
  "Cali Mech Small Seconds",
  "Cali Quartz 2",
  "Cali Quartz Shine"
];

async function run() {
  let updatedCount = 0;
  for (const title of items) {
    const { data, error } = await supabase
      .from('dynamic_links')
      .update({ logo_url: logoUrl })
      .eq('first_name', title)
      .eq('user_id', userId)
      .select('short_id');

    if (error) {
      console.error(`Error updating logo for ${title}:`, error);
    } else {
      updatedCount++;
      if (data && data.length > 0) {
        console.log(`Added logo to ${title} (${data[0].short_id})`);
      }
    }
  }
  console.log(`\nFinished updating logo for ${updatedCount}/${items.length} records.`);
}

run();
