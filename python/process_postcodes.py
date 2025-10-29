"""
Processes postcode data from Open Postcode Geo dataset.

To run this you need to download the dataset from: 
https://www.getthedata.com/open-postcode-geo

Then save it somewhere and update the path in the code below.

"""
language = "php"  # "php" or "js"
postcodes_to_keep = ["SG9", "SG10", "SG11", "SG12", "SG13", "SG14", "EN11", "CM20", "CM21", "CM23"]

csv_lines = []
if language == "php":
    new_lines = ["<?php\n"]
    new_lines.append("$postCodeAreas = [" + ', '.join([f"'{pc}'" for pc in postcodes_to_keep]) + "];\n")
    new_lines.append("$postCodes = [\n")
else:
    new_lines = ["const postCodeAreas = [" + ', '.join([f"'{pc}'" for pc in postcodes_to_keep]) + "];\n"]
    new_lines.append("const postCodes = {\n")

with open (r"C:\Dev\web\LocalMeet\.data\open_postcode_geo.csv", "r") as f:
    for line in f:
        if line[:4] in postcodes_to_keep:
            parts = line.split(",")
            postcode = parts[0].strip('"')
            latitude = parts[7].strip('"')
            longitude = parts[8].strip('"')
            if "N" not in latitude and "N" not in longitude:
                csv_lines.append(f"{postcode},{latitude},{longitude}\n")
                if language == "php":
                    new_lines.append(f"  '{postcode}' => [{latitude}, {longitude}],\n")
                else:
                    new_lines.append(f"  '{postcode}': [{latitude}, {longitude}],\n")

if language == "php":
    new_lines.append("];\n")
    new_lines.append("?>\n")
else:
    new_lines.append("};\n\n")
    new_lines.append("module.exports = { postCodeAreas, postCodes };\n")

# with open (r"C:\Dev\web\LocalMeet\.data\postcodes.csv", "w") as f:
# with open (r"C:\Dev\web\LocalMeet\.data\postCodes.js", "w") as f:
if language == "php":
    fname = r"C:\Dev\web\LocalMeet\data\location\postcodes.php"
else:
    fname = r"C:\Dev\web\LocalMeet\data\location\postCodes.js"
with open (fname, "w") as f:
    f.writelines(new_lines)
csv_lines.sort()
with open (r"C:\Dev\web\LocalMeet\.data\postcodes_subset.csv", "w") as f:
    f.writelines(csv_lines)

print(f"Filtered postcodes saved to {fname}")
print(f"Total postcodes kept: {len(new_lines)}")

"""
php prototype

<?php
$postCodeAreas = ['SG9', 'SG10', 'SG11', 'SG12', 'SG13', 'SG14', 'EN11', 'CM20', 'CM21', 'CM23'];
$postCodes = [
  'CM20 1AA' => [51.771744, 0.093959],
  'CM20 1AB' => [51.76817, 0.095332],
  'CM20 1AD' => [51.771747, 0.093946],
];
?>
"""

"""
JS prototype
const postCodeAreas = ['SG9', 'SG10', 'SG11', 'SG12', 'SG13', 'SG14', 'EN11', 'CM20', 'CM21', 'CM23'];
const postCodes = {
  'CM20 1AA': [51.771744, 0.093959],
  'CM20 1AB': [51.76817, 0.095332],
  'CM20 1AD': [51.771747, 0.093946],
};  
module.exports = { postCodeAreas, postCodes };
"""