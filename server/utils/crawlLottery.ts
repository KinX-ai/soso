import axios from "axios";
import { JSDOM } from "jsdom";
import { InsertLotteryResult } from "@shared/schema";

interface ParsedLotteryResult {
  date: Date;
  region: string;
  special: string;
  first: string;
  second: string[];
  third: string[];
  fourth: string[];
  fifth: string[];
  sixth: string[];
  seventh: string[];
}

export async function crawlLotteryResults(date: Date = new Date()): Promise<InsertLotteryResult[]> {
  try {
    // Format date for URL: YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    
    // Fetch the lottery results from xosohanoi.net
    const response = await axios.get(`https://xosohanoi.net/xsmb-embed?date=${formattedDate}`);
    const html = response.data;
    
    // Parse the HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Initialize result
    const results: InsertLotteryResult[] = [];
    
    // Extract the lottery results
    const result = parseMienBacResult(document, date);
    
    if (result) {
      results.push(result);
    }
    
    return results;
  } catch (error) {
    console.error("Error crawling lottery results:", error);
    throw new Error("Failed to crawl lottery results");
  }
}

function parseMienBacResult(document: Document, date: Date): InsertLotteryResult | null {
  try {
    // Check if results exist
    const table = document.querySelector('.table-result');
    if (!table) {
      return null;
    }
    
    // Initialize result object
    const result: ParsedLotteryResult = {
      date: date,
      region: 'mienbac',
      special: '',
      first: '',
      second: [],
      third: [],
      fourth: [],
      fifth: [],
      sixth: [],
      seventh: []
    };
    
    // Find all rows in the table
    const rows = table.querySelectorAll('tr');
    
    // Extract data from each row
    rows.forEach(row => {
      const prizeNameCell = row.querySelector('td:first-child');
      const prizeName = prizeNameCell ? prizeNameCell.textContent?.trim().toLowerCase() : '';
      
      const prizeValueCells = row.querySelectorAll('td:not(:first-child)');
      const prizeValues: string[] = [];
      
      prizeValueCells.forEach(cell => {
        const value = cell.textContent?.trim() || '';
        if (value) {
          prizeValues.push(value);
        }
      });
      
      // Map prize name to result object property
      if (prizeName?.includes('đặc biệt')) {
        result.special = prizeValues[0] || '';
      } else if (prizeName?.includes('giải nhất')) {
        result.first = prizeValues[0] || '';
      } else if (prizeName?.includes('giải nhì')) {
        result.second = prizeValues;
      } else if (prizeName?.includes('giải ba')) {
        result.third = prizeValues;
      } else if (prizeName?.includes('giải tư')) {
        result.fourth = prizeValues;
      } else if (prizeName?.includes('giải năm')) {
        result.fifth = prizeValues;
      } else if (prizeName?.includes('giải sáu')) {
        result.sixth = prizeValues;
      } else if (prizeName?.includes('giải bảy')) {
        result.seventh = prizeValues;
      }
    });
    
    // Validate that we have some essential data
    if (!result.special || !result.first) {
      return null;
    }
    
    // Convert to InsertLotteryResult
    return {
      date: result.date,
      region: result.region,
      special: result.special,
      first: result.first,
      second: result.second,
      third: result.third,
      fourth: result.fourth,
      fifth: result.fifth,
      sixth: result.sixth,
      seventh: result.seventh
    };
  } catch (error) {
    console.error("Error parsing lottery results:", error);
    return null;
  }
}
