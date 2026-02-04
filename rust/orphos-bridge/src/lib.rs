use orphos_core::config::{OrphosConfig, OutputFormat};
use orphos_core::engine::OrphosAnalyzer;
use orphos_core::output::write_results;
use orphos_core::results::OrphosResults;
use wasm_bindgen::prelude::*;
use wasm_bindgen_file_reader::WebSysFile;

pub mod fastx_wasm;
extern crate console_error_panic_hook;

use crate::fastx_wasm::open_fasta;
use seq_io::fasta::Record;

const MIN_NT_CONTIG: usize = 96; // Taken from Orphos code, I guess also from Prodigal?

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

/// Logging wrapper function for WebAssembly
pub fn logw(text: &str, typ: Option<&str>) {
    if let Some(thetyp) = typ {
        log((String::from("orphos-bridge::") + thetyp + "::" + text).as_str());
    } else {
        log(text);
    }
}

#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
/// Struct to interact with JS when working with WebAssembly
pub struct OrphosData {
    metag: bool,           // If false, set "single" mode, else "meta"
    format: OutputFormat,  // "gbk", "gff", "sco", "gca"
    closed_ends: bool,     // Closed ends (no genes off edges)
    mask_n_runs: bool,     // Mask runs of N's
    force_non_sd: bool,    // Force non-Shine-Dalgarno
    translation_table: u8, // Translation table (1-25). 0 = default/none set
    results: Option<Vec<OrphosResults>>,
    gene_count: Option<usize>,
    sequence_count: Option<usize>,
}

#[wasm_bindgen]
impl OrphosData {
    /// Constructor
    pub fn new(
        metag: bool,
        format: String,
        closed_ends: bool,
        mask_n_runs: bool,
        force_non_sd: bool,
        translation_table: u8,
    ) -> Self {
        if cfg!(debug_assertions) {
            init_panic_hook();
        }

        // Validate translation table
        if !(0..=25).contains(&translation_table)
            || translation_table == 7
            || translation_table == 8
            || (17..=20).contains(&translation_table)
        {
            panic!("Invalid translation table specified");
        }
        // Get proper output format  // TODO: remove?
        let output_format = match format.as_str() {
            "gbk" | "genbank" => OutputFormat::Genbank,
            "gff" => OutputFormat::Gff,
            "sco" => OutputFormat::Sco,
            "gca" => OutputFormat::Gca,
            _ => panic!("Invalid output format"),
        };

        OrphosData {
            metag,
            format: output_format, // TODO
            closed_ends,
            mask_n_runs,
            force_non_sd,
            translation_table,
            results: None,
            gene_count: None,
            sequence_count: None,
        }
    }

    /// Main function to analyse a genome
    pub fn analyse_genome(&mut self, input_file: web_sys::File) {
        logw("Analysing fasta file. Getting config struct.", Some("info"));

        // Get an OrphosConfig struct to properly interact with Orphos
        let orphosconfig = OrphosConfig {
            metagenomic: self.metag,
            closed_ends: self.closed_ends,
            mask_n_runs: self.mask_n_runs,
            force_non_sd: self.force_non_sd,
            quiet: true,
            output_format: self.format,
            translation_table: if self.translation_table == 0 {
                None
            } else {
                Some(self.translation_table)
            },
            num_threads: None,
        };

        // Iterate over FASTA and analyse individually each contig/record
        logw("Creating reader and Orphos analyser...", Some("info"));
        let mut input_file_ws = WebSysFile::new(input_file);
        let mut reader = open_fasta(&mut input_file_ws);
        let mut analyser = OrphosAnalyzer::new(orphosconfig);
        let mut all_results = Vec::new();
        let (mut seqrec, mut id, mut desc, mut tmpid, mut tmpdesc, mut tmpvec, mut tmpres);

        logw("Entering while loop (analysing)...", Some("info"));
        while let Some(record) = reader.next() {
            seqrec = record.expect("Invalid FASTA record");
            (id, desc) = seqrec.id_desc().unwrap();

            tmpdesc = desc.map(|s| s.to_string());
            tmpid = id.to_owned();
            tmpvec = seqrec.full_seq().to_vec();

            logw(
                format!(
                    "tmpid: {:?}, tmpdesc: {:?}, tmpvec len: {:?}",
                    tmpid,
                    tmpdesc,
                    tmpvec.len()
                )
                .as_str(),
                None,
            );
            logw(format!("{:?}", str::from_utf8(&tmpvec)).as_str(), None);
            logw(format!("tmpvec: {:?}", tmpvec).as_str(), None);
            // logw(format!("tmpvec: {:?}", tmpvec.iter().rev().take(25).collect::<Vec<_>>()).as_str(), None);

            if tmpvec.len() < MIN_NT_CONTIG {
                logw(
                    format!(
                        "Contig found with less than {:?} nucleotides. Ignoring...",
                        MIN_NT_CONTIG
                    )
                    .as_str(),
                    Some("warn"),
                );
                continue;
            }

            tmpres = analyser
                .analyze_sequence_bytes(&tmpvec, tmpid, tmpdesc)
                .expect("Error analysing FASTA record.");

            all_results.push(tmpres);
        }
        logw(
            "Analysis done. Saving results as attribute...",
            Some("info"),
        );
        self.gene_count = Some(all_results.iter().map(|r| r.genes.len()).sum::<usize>());
        self.sequence_count = Some(all_results.len());
        self.results = Some(all_results);
    }

    pub fn get_results(self, format: String) -> String {
        let output_format = match format.as_str() {
            "gbk" | "genbank" => OutputFormat::Genbank,
            "gff" => OutputFormat::Gff,
            "sco" => OutputFormat::Sco,
            "gca" => OutputFormat::Gca,
            _ => panic!("Invalid output format"),
        };

        // Generate output
        let mut output = Vec::new();
        for result in &self.results.unwrap() {
            let _ = write_results(&mut output, result, output_format);
        }

        // TODO: check that we really can ignpore format until this function is called

        let mut results = json::JsonValue::new_array();

        results["output_file"] = json::JsonValue::String(
            String::from_utf8(output).expect("Unable to obtain string of the output file"),
        );
        results["gene_count"] = json::JsonValue::Number(self.gene_count.unwrap().into());
        results["sequence_count"] = json::JsonValue::Number(self.sequence_count.unwrap().into());

        results.dump()
    }
}
