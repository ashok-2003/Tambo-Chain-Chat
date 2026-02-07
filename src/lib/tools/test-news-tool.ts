
import { fetchCryptoNews } from "./news";

async function testNews() {
    console.log("----------------------------------------");
    console.log("TEST: Fetching general crypto news (no topic)");
    console.log("----------------------------------------");

    try {
        const generalNews = await fetchCryptoNews({});
        console.log(`✅ Success! Received ${generalNews.length} news items.`);

        if (generalNews.length > 0) {
            console.log("\nSample Item 1:");
            console.log(`Title: ${generalNews[0].title}`);
            console.log(`Source: ${generalNews[0].domain}`);
            console.log(`Published: ${generalNews[0].published_at}`);
            console.log(`Link: ${generalNews[0].url}`);
        }
    } catch (error) {
        console.error("❌ Failed to fetch general news:", error);
    }

    console.log("\n\n----------------------------------------");
    console.log("TEST: Fetching news for topic 'bitcoin'");
    console.log("----------------------------------------");

    try {
        const bitcoinNews = await fetchCryptoNews({ topic: "bitcoin" });
        console.log(`✅ Success! Received ${bitcoinNews.length} news items related to 'bitcoin'.`);

        if (bitcoinNews.length > 0) {
            console.log("\nSample Item 1:");
            console.log(`Title: ${bitcoinNews[0].title}`);
            console.log(`Source: ${bitcoinNews[0].domain}`);
            console.log(`Published: ${bitcoinNews[0].published_at}`);
        } else {
            console.log("⚠️ No news found for 'bitcoin', which is unexpected for a major topic.");
        }
    } catch (error) {
        console.error("❌ Failed to fetch bitcoin news:", error);
    }
}

// Run the test
testNews();
