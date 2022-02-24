# Convert format used at http://format.gbv.de/ to new format
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
            .|map({url,type})
          )
        }
      }) | from_entries
  )
}
else
{ }
end
|del(..|nulls)
