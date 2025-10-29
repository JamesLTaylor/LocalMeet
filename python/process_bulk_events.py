#addedAt, lastEdited, registeredUsers, interestedUsers, isCancelled, isDeleted, originalFilePath

# open events.csv
import csv
import datetime as dt
import json
import os
BASE_PATH = r"C:\Dev\web\LocalMeet"

# read the csv file
pth = os.path.join(BASE_PATH, "python", "events.csv")
with open(pth, mode='r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    events = [row for row in reader]

# process the events
for event in events:
    event['addedAt'] = dt.datetime.now().isoformat()
    event['lastEdited'] = dt.datetime.now().isoformat()
    event['registeredUsers'] = []
    event['interestedUsers'] = []
    event['isCancelled'] = False
    event['isDeleted'] = False
    event["categoryTags"] = [tag.strip() for tag in event["categoryTags"].split(",") if tag.strip()]
    event["groupTags"] = [tag.strip() for tag in event["groupTags"].split(",") if tag.strip()]
    date = dt.datetime.strptime(event['date'], "%Y/%m/%d")
    time = dt.datetime.strptime(event['time'], "%H:%M").time()
    event['date'] = dt.datetime.combine(date.date(), time).isoformat()
    year, month, day = event["date"][:10].split("-")
    fname = day + "_" + event['title'].lower().replace(" ", "_") + ".json"
    pth = os.path.join(BASE_PATH, "data", "events", year, month, fname)
    event['originalFilePath'] = fname
    # save each event as a json file

    os.makedirs(os.path.dirname(pth), exist_ok=True)
    with open(pth, mode='w', encoding='utf-8') as f:
        json.dump(event, f, ensure_ascii=False, indent=4)
        print(f"Saved event to {pth}")
