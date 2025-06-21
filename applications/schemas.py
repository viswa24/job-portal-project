education_qualifications = {
    "type": "array",
    "label": "Education Qualifications",
    "subfields": {
        "class": {"type": "text", "label": "Class/Course"},
        "course": {"type": "text", "label": "Course"},
        "percentage": {"type": "text", "label": "Percentage"},
        "certificate": {"type": "file", "label": "Certificate"},
        "year_of_passing": {"type": "text", "label": "Year of Passing"},
        "board": {"type": "text", "label": "Board/University"}
    }
},
work_experience = {
    "type": "array",
    "label": "Work Experience",
    "subfields": {
        "designation": {"type": "text", "label": "Designation"},
        "institution": {"type": "text", "label": "Institution/Company"},
        "from_date": {"type": "date", "label": "From Date"},
        "to_date": {"type": "date", "label": "To Date"},
        "tasks_duties": {"type": "textarea", "label": "Tasks and Duties"},
        "certificate": {"type": "file", "label": "Experience Certificate"}
    }
}, 