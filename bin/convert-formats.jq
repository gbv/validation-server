# Convert format used at http://format.gbv.de/ to new format

def cleanid:
  if startswith("schema/") then
    .[7:]
  elif test("^rdf/(json-ld|turtle|ntriples|hdt)") then
    .[4:]
  else
    .
  end
;

def cleanids:
  if . == null then
    null
  elif type == "array" then
    map(cleanid)
  else
    [ cleanid ]
  end
;

map(
  {
    id: (.id|cleanid),
    title,
    short,
    base: (.base|cleanids),
    restricts: (.for|cleanids),
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
  |select(.versions)
)

| map({
  key: (.id | cleanid),
  value: .
})
| from_entries

# Usage: jq . -s ../format.gbv.de/formats.ndjson | jq -f bin/convert-formats.jq > format.gbv.de.json
