# Open Buckets - Architectural Diagrams

This document contains all architectural diagrams for the Open Buckets system using the C4 Model.

---

## C4 Level 1: System Context

```mermaid
C4Context
  title System Context - Open Buckets

  Person(user, "Developer/System Admin", "Monitors directories for file drops")
  Person(ops_user, "DevOps Engineer", "Deploys and manages daemon mode")

  System(open_buckets, "Open Buckets", "Directory monitoring and file processing system")

  System_Ext(filesystem, "File System", "Directories to watch and files to process")

  System_Ext(text_editor, "Obsidian/Markdown Editor", "Views generated markdown output")

  System_Ext(cli_terminal, "CLI Terminal", "Interacts with Open Buckets via command line")

  Rel(user, open_buckets, "Monitors directories", "CLI commands")
  Rel(ops_user, open_buckets, "Deploys daemon", "CLI commands")
  Rel(open_buckets, filesystem, "Watches directories\nProcesses files", "fs.watch()")
  Rel(open_buckets, text_editor, "Generates markdown output", "Obsidian-flavored markdown")
  Rel(user, text_editor, "Views output", "Reads markdown")
  Rel(user, cli_terminal, "Interacts via CLI", "Commands")
  Rel(ops_user, cli_terminal, "Manages daemon", "Commands")
```

---

## C4 Level 2: Container View

```mermaid
C4Container
  title Container View - Open Buckets

  Container(cli, "CLI Interface", "Node.js", "Command-line entry point\nArgument parsing\nValidation")
  Container(watcher_service, "Watcher Service", "Node.js fs.watch()", "Directory watching\nFile event detection")
  Container(pattern_engine, "Pattern Engine", "Glob matching", "Gitignore-style patterns\nInclude/exclude logic")
  Container(context_builder, "Context Builder", "TOML + Ripgrep/Grep", "Configuration parsing\nDirectory grep\nContext aggregation")
  Container(processor, "File Processor", "Text detection", "File type detection\nContent reading\nMarkdown generation")
  Container(daemon_manager, "Daemon Manager", "Fork + PID", "Process forking\nPID file management\nSignal handling")
  Container(error_tracker, "Error Tracker", "File system", "Error file creation\nFailure tracking")
  Container(output_generator, "Output Generator", "Markdown", "Obsidian-flavored markdown\nFrontmatter\nWikilinks")

  ContainerDb(config_store, "Configuration Store", "File System", ".bucket-include files\nPer-extension skills")

  Rel(cli, watcher_service, "Starts watching", "Directory list")
  Rel(watcher_service, pattern_engine, "Filters file events", "File paths")
  Rel(pattern_engine, config_store, "Reads patterns", "TOML config")
  Rel(watcher_service, context_builder, "Triggers context build", "File events")
  Rel(context_builder, config_store, "Reads configuration", "TOML + Directory grep")
  Rel(context_builder, processor, "Processes matched files", "File paths")
  Rel(processor, output_generator, "Generates output", "File contents")
  Rel(processor, error_tracker, "Reports errors", "Error details")
  Rel(cli, daemon_manager, "Forks daemon", "Watch config")
  Rel(daemon_manager, watcher_service, "Starts watcher", "Directory list")
```

---

## C4 Level 3: Component - Watcher Service

```mermaid
C4Component
  title Component View - Watcher Service

  Container(watcher_service, "Watcher Service", "Directory monitoring")

  Component(event_listener, "Event Listener", "fs.watch() wrapper", "Receives file system events")
  Component(event_debouncer, "Event Debouncer", "Delay mechanism", "100ms delay for file writes")
  Component(event_router, "Event Router", "Event dispatcher", "Routes events to processors")
  Component(directory_registry, "Directory Registry", "Map of directories", "Maintains watcher instances")

  Rel(event_listener, event_debouncer, "Sends raw events", "eventType, filename")
  Rel(event_debouncer, event_router, "Sends debounced events", "filePath, dir")
  Rel(event_router, directory_registry, "Queries directory info", "directoryId")
  Rel(directory_registry, event_listener, "Manages watchers", "watcher instances")
```

---

## C4 Level 3: Component - Context Builder

```mermaid
C4Component
  title Component View - Context Builder

  Container(context_builder, "Context Builder", "Configuration and grep")

  Component(config_parser, "Config Parser", "TOML parser", "Parses .bucket-include files")
  Component(pattern_resolver, "Pattern Resolver", "Glob resolver", "Resolves include/exclude patterns")
  Component(dir_grep_engine, "Directory Grep Engine", "Ripgrep/Grep wrapper", "Searches file contents")
  Component(context_aggregator, "Context Aggregator", "Context builder", "Combines matched files")
  Component(skill_loader, "Skill Loader", "File-type skill loader", "Loads .ext.bucket-include")

  Rel(config_parser, pattern_resolver, "Provides patterns", "include, exclude")
  Rel(pattern_resolver, dir_grep_engine, "Provides directory patterns", "dirs")
  Rel(dir_grep_engine, context_aggregator, "Returns matched files", "file paths")
  Rel(skill_loader, config_parser, "Provides per-extension config", "TOML")
  Rel(config_parser, context_aggregator, "Provides merged config", "configuration")
```

---

## C4 Level 3: Component - File Processor

```mermaid
C4Component
  title Component View - File Processor

  Container(processor, "File Processor", "File processing and type detection")

  Component(binary_detector, "Binary Detector", "Heuristics", "Detects binary files")
  Component(content_reader, "Content Reader", "File reader", "Reads file contents")
  Component(encoder, "Encoder", "UTF-8 decoder", "Detects and decodes encoding")
  Component(output_formatter, "Output Formatter", "Console formatter", "Formats output for display")
  Component(md_generator, "Markdown Generator", "Markdown writer", "Generates Obsidian markdown")

  Rel(binary_detector, content_reader, "Detects before read", "filePath")
  Rel(content_reader, encoder, "Passes raw bytes", "buffer")
  Rel(encoder, output_formatter, "Passes decoded text", "string")
  Rel(output_formatter, md_generator, "Passes formatted text", "formatted")
  Rel(md_generator, content_reader, "Writes to disk", "markdown")
```

---

## C4 Level 3: Component - Success Tracker

```mermaid
C4Component
  title Component View - Success Tracker

  Container(success_tracker, "Success Tracker", "Success record management")

  Component(record_validator, "Record Validator", "Schema validator", "Validates success record format")
  Component(record_builder, "Record Builder", "Object builder", "Constructs success record from data")
  Component(file_writer, "File Writer", "File system writer", "Persists JSON records to disk")
  Component(metrics_updater, "Metrics Updater", "Metrics interface", "Updates metrics collector")
  Component(record_indexer, "Record Indexer", "In-memory index", "Maintains index of records for queries")

  Rel(record_validator, record_builder, "Validates", "SuccessRecord schema")
  Rel(record_builder, file_writer, "Persists", "SUCCESS-*.json")
  Rel(record_builder, metrics_updater, "Updates", "Success metrics")
  Rel(file_writer, record_indexer, "Indexes", "Record metadata")
  Rel(record_indexer, metrics_updater, "Provides stats", "Record counts")
```

---

## C4 Level 3: Component - Error Tracker

```mermaid
C4Component
  title Component View - Error Tracker

  Container(error_tracker, "Error Tracker", "Error record management")

  Component(error_classifier, "Error Classifier", "Categorization engine", "Categorizes errors by type")
  Component(error_context, "Error Context Builder", "Context extractor", "Extracts operation context")
  Component(error_formatter, "Error Formatter", "Structured formatter", "Formats error details")
  Component(error_writer, "Error Writer", "File system writer", "Persists JSON records to disk")
  Component(error_aggregator, "Error Aggregator", "Statistics engine", "Aggregates error statistics")
  Component(recovery_logger, "Recovery Logger", "Recovery tracker", "Logs recovery attempts")

  Rel(error_classifier, error_context, "Classifies", "Error category")
  Rel(error_context, error_formatter, "Provides context", "Operation details")
  Rel(error_formatter, error_writer, "Persists", "ERROR-*.json")
  Rel(error_formatter, error_aggregator, "Aggregates", "Error statistics")
  Rel(error_classifier, recovery_logger, "Tracks", "Recovery attempts")
  Rel(error_aggregator, metrics_updater, "Updates", "Error metrics")
```

---

## C4 Level 3: Component - Metrics Collector

```mermaid
C4Component
  title Component View - Metrics Collector

  Container(metrics_collector, "Metrics Collector", "Metrics aggregation")

  Component(counter_aggregator, "Counter Aggregator", "Sum counter", "Accumulates count metrics")
  Component(gauge_sampler, "Gauge Sampler", "Value sampler", "Samples gauge metrics")
  Component(histogram_collector, "Histogram Collector", "Distribution collector", "Collects histogram data")
  Component(rate_calculator, "Rate Calculator", "Rate engine", "Calculates rates (per second)")
  Component(percentile_calculator, "Percentile Calculator", "Percentile engine", "Calculates P50, P90, P95, P99")
  Component(snapshot_generator, "Snapshot Generator", "Snapshot engine", "Generates periodic snapshots")
  Component(alert_checker, "Alert Checker", "Threshold monitor", "Monitors metrics against thresholds")

  Rel(counter_aggregator, snapshot_generator, "Provides", "Counter totals")
  Rel(gauge_sampler, snapshot_generator, "Provides", "Gauge values")
  Rel(histogram_collector, percentile_calculator, "Provides", "Distribution data")
  Rel(rate_calculator, snapshot_generator, "Provides", "Rate metrics")
  Rel(percentile_calculator, snapshot_generator, "Provides", "Percentile values")
  Rel(snapshot_generator, alert_checker, "Monitors", "Metric thresholds")
  Rel(alert_checker, metrics_updater, "Triggers", "Alert notifications")
```

---

## Sequence Diagram: File Drop Processing

```mermaid
sequenceDiagram
  autonumber
  participant User
  participant CLI as CLI Interface
  participant WS as Watcher Service
  participant PE as Pattern Engine
  participant CB as Context Builder
  participant FP as File Processor
  participant OG as Output Generator
  participant FS as File System

  User->>FS: Drop file into directory
  FS->>WS: fs.watch() event (rename)
  WS->>WS: Event Debouncer (100ms)
  WS->>FS: Check if file exists
  FS-->>WS: File exists
  WS->>PE: Filter file by patterns
  PE->>FS: Load .bucket-include
  FS-->>PE: TOML config
  PE-->>WS: File matches patterns
  WS->>CB: Build context for file
  CB->>FS: Load config and run grep
  FS-->>CB: Matched files
  CB->>FP: Process matched files
  FP->>FS: Read file contents
  FS-->>FP: File data
  FP->>FP: Detect file type (text/binary)
  FP->>OG: Generate markdown
  OG-->>FP: Obsidian markdown
  FP->>FS: Write markdown file
  User->>FS: View markdown in Obsidian
```

---

## Sequence Diagram: Daemon Startup

```mermaid
sequenceDiagram
  autonumber
  participant User
  participant CLI as CLI Interface
  participant DM as Daemon Manager
  participant Child as Daemon Process
  participant WS as Watcher Service
  participant FS as File System

  User->>CLI: open-buckets --daemon --watch ./incoming
  CLI->>DM: start(watchCallback)
  DM->>DM: Check if already running
  DM->>DM: Fork child process
  DM->>Child: Detach and unref
  DM->>FS: Write PID file (open-buckets.pid)
  DM-->>User: Daemon started (PID: 12345)

  Note over Child: Daemon Process Running
  Child->>Child: Setup signal handlers (SIGTERM, SIGINT)
  Child->>WS: start(["/path/to/incoming"])
  WS->>FS: fs.watch() directories
  FS-->>WS: Ready to monitor

  loop File Drop Detection
    FS-->>WS: File event
    WS->>WS: Process file
  end

  User->>Child: SIGTERM (kill command)
  Child->>FS: Remove PID file
  Child->>Child: Stop watchers
  Child->>Child: Exit (0)
```

---

## Sequence Diagram: Context Building

```mermaid
sequenceDiagram
  autonumber
  participant WS as Watcher Service
  participant CB as Context Builder
  participant CP as Config Parser
  participant SL as Skill Loader
  participant PR as Pattern Resolver
  participant DGE as Directory Grep Engine
  participant CA as Context Aggregator
  participant FS as File System

  WS->>CB: buildContext(directory)
  CB->>CP: Load .bucket-include
  CP->>FS: Read config file
  FS-->>CP: TOML content
  CP-->>CB: Parsed config

  alt File-Type Skill Exists
    CB->>SL: Load .ext.bucket-include
    SL->>FS: Read skill file
    FS-->>SL: TOML content
    SL-->>CB: Merged config
  end

  CB->>PR: Resolve include patterns
  PR-->>CB: Include glob patterns
  CB->>PR: Resolve exclude patterns
  PR-->>CB: Exclude glob patterns

  alt Directory Grep Configured
    CB->>DGE: grepDirectory(path, pattern)
    DGE->>DGE: Try ripgrep
    alt ripgrep available
      DGE->>FS: Execute ripgrep
      FS-->>DGE: Matched files
    else ripgrep not available
      DGE->>FS: Execute grep
      FS-->>DGE: Matched files
    end
    DGE-->>CB: Matched file paths
  end

  CB->>CA: Aggregate all matched files
  CA-->>CB: Final context
  CB-->>WS: { files, metadata, errors }
```

---

## State Diagram: Daemon Lifecycle

```mermaid
stateDiagram-v2
  [*] --> NOT_RUNNING
  NOT_RUNNING --> STARTING: start()
  STARTING --> RUNNING: Fork successful
  STARTING --> NOT_RUNNING: Fork failed
  RUNNING --> STOPPING: SIGTERM/SIGINT
  STOPPING --> NOT_RUNNING: Cleanup complete
  RUNNING --> NOT_RUNNING: Crash (optional restart)

  note right of NOT_RUNNING
    No daemon process
    No PID file
  end note

  note right of RUNNING
    Daemon active
    PID file exists
    Watching directories
  end note
```

---

## State Diagram: File Processing

```mermaid
stateDiagram-v2
  [*] --> FILE_DETECTED
  FILE_DETECTED --> PATTERN_MATCH: Check patterns
  PATTERN_MATCH --> IGNORED: No match
  PATTERN_MATCH --> CONTEXT_BUILD: Match found
  CONTEXT_BUILD --> IGNORED: No files to process
  CONTEXT_BUILD --> PROCESS: Files to process
  PROCESS --> OUTPUT_GENERATED: Success
  PROCESS --> ERROR_TRACKED: Error
  OUTPUT_GENERATED --> [*]
  ERROR_TRACKED --> [*]
  IGNORED --> [*]

  note right of FILE_DETECTED
    File dropped in watched dir
    After debouncing
  end note

  note right of CONTEXT_BUILD
    Load .bucket-include
    Run directory grep
    Aggregate context
  end note

  note right of ERROR_TRACKED
    Create .error file
    Log error details
    Continue processing
  end note
```

---

## Sequence Diagram: Runner Startup

```mermaid
sequenceDiagram
  autonumber
  participant User
  participant CLI as CLI Interface
  participant Runner as Runner Engine
  participant WS as Watcher Service
  participant ST as Success Tracker
  participant ET as Error Tracker
  participant MC as Metrics Collector
  participant FS as File System

  User->>CLI: open-buckets --watch ./incoming --watch ./processed
  CLI->>Runner: initialize(config)
  Runner->>Runner: Validate directories
  Runner->>ST: initialize(errorDir)
  Runner->>ET: initialize(errorDir)
  Runner->>MC: initialize(metricsInterval)

  Runner->>WS: start([directories])
  WS->>FS: fs.watch() on each directory
  WS-->>Runner: Watchers started

  Runner->>MC: startPeriodicSnapshots()
  MC->>MC: Set interval (60s)

  Runner-->>CLI: Runner started
  CLI-->>User: Monitoring directories...

  Note over User,FS: System running - processing file drops
```

---

## Sequence Diagram: Success Processing with Tracking

```mermaid
sequenceDiagram
  autonumber
  participant WS as Watcher Service
  participant CB as Context Builder
  participant FP as File Processor
  participant ST as Success Tracker
  participant OG as Output Generator
  participant MC as Metrics Collector
  participant FS as File System

  WS->>CB: buildContext(file)
  CB->>FS: Read .bucket-include
  CB->>FS: Run grep
  CB-->>WS: Context built

  WS->>FP: process(file, context)
  FP->>FS: Read file content
  FP->>OG: Generate markdown
  OG->>FS: Write .md file
  FS-->>FP: Output written

  FP->>ST: recordSuccess(filePath, result)
  ST->>ST: Validate result
  ST->>ST: Build success record
  ST->>FS: Write SUCCESS-*.json
  ST->>MC: updateMetrics(success)
  ST-->>FP: Success recorded

  FP-->>WS: Processing complete
```

---

## Sequence Diagram: Error Processing with Tracking

```mermaid
sequenceDiagram
  autonumber
  participant WS as Watcher Service
  participant CB as Context Builder
  participant FP as File Processor
  participant ET as Error Tracker
  participant MC as Metrics Collector
  participant FS as File System

  WS->>CB: buildContext(file)
  CB->>FS: Read .bucket-include
  CB->>FS: Run grep (ripgrep)
  FS-->>CB: Error (ripgrep not found)

  CB->>CB: Try fallback (grep)
  CB->>FS: Run grep
  FS-->>CB: Success

  CB-->>WS: Context built (with fallback)

  WS->>FP: process(file, context)
  FP->>FS: Read file content
  FS-->>FP: Error (permission denied)

  FP->>ET: recordError(error, context)
  ET->>ET: Classify error (FileAccessError)
  ET->>ET: Build error context
  ET->>FS: Write ERROR-*.json
  ET->>MC: updateMetrics(error)
  ET-->>FP: Error recorded

  FP->>FP: Continue with next file
  FP-->>WS: Processing skipped
```

---

## State Diagram: Success Tracker Lifecycle

```mermaid
stateDiagram-v2
  [*] --> IDLE
  IDLE --> VALIDATING: recordSuccess()
  VALIDATING --> IDLE: Validation failed
  VALIDATING --> BUILDING: Validation passed
  BUILDING --> METRICS_UPDATING: Record built
  METRICS_UPDATING --> WRITING: Metrics updated
  WRITING --> IDLE: Write successful
  WRITING --> ERROR_STATE: Write failed

  ERROR_STATE --> IDLE: Log and continue
```

---

## State Diagram: Error Tracker Lifecycle

```mermaid
stateDiagram-v2
  [*] --> IDLE
  IDLE --> CLASSIFYING: recordError()
  CLASSIFYING --> BUILDING_CONTEXT: Classification complete
  BUILDING_CONTEXT --> FORMATTING: Context built
  FORMATTING --> AGGREGATING: Record formatted
  AGGREGATING --> METRICS_UPDATING: Aggregation complete
  METRICS_UPDATING --> WRITING: Metrics updated
  WRITING --> IDLE: Write successful
  WRITING --> ERROR_STATE: Write failed

  ERROR_STATE --> IDLE: Log and continue
```

---

## Data Flow: Processing Pipeline

```mermaid
flowchart TD
    A[File Drop] --> B[Event Listener]
    B --> C[Event Debouncer]
    C --> D[Event Router]
    D --> E{Pattern Match?}
    E -->|No| F[Ignore]
    E -->|Yes| G[Context Builder]
    G --> H[Config Parser]
    G --> I[Pattern Resolver]
    G --> J[Directory Grep]
    G --> K[Skill Loader]
    H --> L[Context Aggregator]
    I --> L
    J --> L
    K --> L
    L --> M[File Processor]
    M --> N[Binary Detector]
    N -->|Binary| O[Skip]
    N -->|Text| P[Content Reader]
    P --> Q[Output Generator]
    Q --> R[Markdown File]
    R --> S[Error Tracker]
    S --> T[.error File]
    S --> U[Metrics]
```

---

## Deployment Diagram

```mermaid
flowchart TB
    subgraph "Host Machine"
        A[CLI Interface] --> B[Watcher Service]
        B --> C[Context Builder]
        C --> D[File Processor]
        D --> E[Output Generator]
    end

    subgraph "File System"
        F[Watched Directories]
        G[.bucket-include Files]
        H[Output Files .md]
        I[Error Files .error]
    end

    subgraph "External Tools"
        J[ripgrep]
        K[grep]
    end

    B --> F
    C --> G
    C --> J
    C --> K
    D --> F
    E --> H
    D --> I
```

---

## Complete Runner Data Flow

```mermaid
flowchart TD
    subgraph "Input"
        A[File Drop]
        B[.bucket-include Config]
    end

    subgraph "Watcher Service"
        C[Event Listener]
        D[Event Debouncer]
        E[Event Router]
    end

    subgraph "Context Builder"
        F[Config Parser]
        G[Pattern Resolver]
        H[Directory Grep Engine]
    end

    subgraph "File Processor"
        I[Binary Detector]
        J[Content Reader]
        K[Output Generator]
    end

    subgraph "Tracking System"
        L[Success Tracker]
        M[Error Tracker]
        N[Metrics Collector]
    end

    subgraph "Output"
        O[Markdown Files]
        P[Success Records JSON]
        Q[Error Records JSON]
        R[Metrics Snapshots]
        S[Placeholders MD]
    end

    A --> C
    C --> D
    D --> E
    B --> F
    B --> G
    F --> E
    G --> E
    E --> H
    H --> I
    I --> J
    J --> K

    K -->|Success| L
    K -->|Error| M

    L --> P
    L --> N
    M --> Q
    M --> N

    N --> R
    N --> S

    K --> O

    style L fill:#d4edda
    style M fill:#f8d7da
    style N fill:#fff3cd
    style O fill:#e1f5ff
    style P fill:#d4edda
    style Q fill:#f8d7da
    style R fill:#fff3cd
    style S fill:#e1f5ff
```

---

## Error Recovery Flow

```mermaid
flowchart TD
    A[Error Detected] --> B{Error Type?}

    B -->|Configuration| C[Use Default Config]
    B -->|FileAccess| D[Skip File]
    B -->|ExternalTool| E[Try Fallback]

    E --> F{Fallback Available?}
    F -->|Yes| G[Execute Fallback]
    F -->|No| H[Check Circuit Breaker]

    G --> I{Fallback Success?}
    I -->|Yes| J[Continue Processing]
    I -->|No| H

    H --> K{Circuit State?}
    K -->|CLOSED| L[Retry with Backoff]
    K -->|HALF OPEN| M[Test Call]
    K -->|OPEN| N[Skip & Log Error]

    L --> O{Max Retries?}
    O -->|No| E
    O -->|Yes| P[Open Circuit]

    M --> Q{Test Success?}
    Q -->|Yes| R[Close Circuit]
    Q -->|No| P

    N --> S[Record Error]
    P --> S
    C --> T[Continue with Defaults]
    D --> S

    style E fill:#fff3cd
    style G fill:#fff3cd
    style L fill:#fff3cd
    style M fill:#fff3cd
    style P fill:#f8d7da
    style N fill:#f8d7da
    style S fill:#f8d7da
```

---

## Metrics Aggregation Flow

```mermaid
flowchart LR
    subgraph "Sources"
        A[Success Tracker]
        B[Error Tracker]
        C[Watcher Service]
        D[Processor Manager]
    end

    subgraph "Metrics Collector"
        E[Counter Aggregator]
        F[Gauge Sampler]
        G[Histogram Collector]
        H[Rate Calculator]
        I[Percentile Calculator]
    end

    subgraph "Output"
        J[Console Display]
        K[Log Files JSON]
        L[METRICS_SNAPSHOT.md]
    end

    A --> E
    B --> E
    A --> F
    B --> F
    C --> F
    D --> G
    A --> G
    B --> G

    E --> H
    F --> H
    E --> I
    G --> I

    H --> J
    F --> J
    H --> K
    I --> K
    H --> L
    I --> L

    style E fill:#d1ecf1
    style F fill:#d1ecf1
    style G fill:#d1ecf1
    style H fill:#d1ecf1
    style I fill:#d1ecf1
    style L fill:#e1f5ff
```

---

## Legend

### C4 Model Levels

- **Level 1: System Context** - Big picture view of the system in its environment
- **Level 2: Containers** - High-level technology building blocks
- **Level 3: Components** - Logical groupings within containers

### Notation

- **Person** - User or stakeholder
- **System** - Software system being documented
- **Container** - Deployable unit (service, database, app)
- **Component** - Logical grouping of functionality
- **Rel(Relationship)** - Communication between elements

---

## How to View These Diagrams

1. **Mermaid Live Editor:** https://mermaid.live
2. **GitHub/GitLab:** Native Mermaid rendering in markdown
3. **VS Code:** Install Mermaid Preview extension
4. **Obsidian:** Install Mermaid plugin
5. **Command Line:** `mmdc` (Mermaid CLI)

---

**References:**
- [C4 Model](https://c4model.com)
- [Mermaid Documentation](https://mermaid.js.org)
- [arc42 Template](https://arc42.org)
