# Convert format used at http://format.gbv.de/ to new format
map(
  {
    id,
    title,
    short,
    base,
    restricts: .for,
    url: .homepage,
  }
  + if .schemas then
  {
    versions: (
      .schemas | map(. + {version: (.version // "default")})
      | group_by(.version)
      | map({
          key: .[0].version,
          value: {
            schemas: (
              .|map({
                url: (if (.url|startswith("http")) then .url else ("https://format.gbv.de" + .url) end),
                type
              })
            )
          }
        }) | from_entries
    )
  }
  else
  { }
  end
  |del(..|nulls)
  | select(.versions)
  |{
    key: (if (.id|startswith("schema/")) then .id[7:] else .id end),
    value: .
  }

)|from_entries

# Usage: jq . -s ../format.gbv.de/formats.ndjson | jq -f bin/convert-formats.jq > format.gbv.de.json
