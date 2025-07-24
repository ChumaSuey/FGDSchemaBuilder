# FGD Schema Builder

(Personal text from main programmer Chuma)
FGD Schema Builder is a React script i've made not so long ago, the idea started via a suggestion of my friend Lavender, then i proceeded to sit down the code to experiment and at least do some automation on the editing of FGD files for the level editor Trenchbroom, associated with Quake family branch games and possibly Godot... i've got help from a lot of friends and people from the Quake community, this project was not easy... i was happy with doing this and attempting to make an automation script even for experimental purposes, even if it's not optimal, hope you enjoy this documentation, thank you in advance)

Proceeding now with the formal talk of the project.

The app will be referred as SB for simplification.

Website : https://chumasuey.github.io/FGDSchemaBuilder

## Technical Aspects / Technical Content

The script is made out of React (Javascript language), there are some remnants in some branches of Python (possibly this one) but it doesn't work, what Python initially in backend was the parsing and file handling.


# Instructions on how to use the Website.

It's very recommended the user uses an FGD file as an skeletal reference or template... There are some notes to point out from the script that are going to be appointed.

Also it's very recommended to partially edit the file manually in certain parts or corrections, the website

When entering the website, the next picture show as follows.

<img width="1879" height="883" alt="image" src="https://github.com/user-attachments/assets/0c5a1e0c-d763-4d9e-a6ac-8ce9fbcd620a" />


Colors were used to segment and classify all the functionality better.

There are 3 columns : 
- Left(Orange) : Shows the entity list of the fgd file, it also has a search bar and a filter by entity.
- Center(Yellow) : Shows the properties of the selected entity.
- Right(Red) : Is a live viewer of the FGD file as seen in UTF-8 or a close approximation of it.
There's one upper side to the website, in a short description fashion:
- Up(Green) : Are the buttons "property" buttons of the website.

As stated before the workflow is to edit an already existing FGD file, while the user can start from scratch, and that's technically possible, focus is going to be on the main workflow functionality.

The website internally stores the FGD file information locally unless the work is exported.

Since the website has been seen without any FGD loaded, one is going to be in the next picture, Quake.fgd of preference:

<img width="1849" height="880" alt="image" src="https://github.com/user-attachments/assets/65ca1fca-8479-4840-a2f0-5d4878ab3bbf" />

<img width="620" height="540" alt="image" src="https://github.com/user-attachments/assets/dbd0290b-9fcd-4195-bb35-a8b23368aef9" />

Entities can have a wide range of different properties, with these pictures you can see the script in plain action.

Once finishing the editing process of the FGD Script, user should press "Export FGD" to save the work.

## In-Depth Function of the buttons.

Alphabetical Order: Enforces the Alphabetical Order in the Entity list, important to say: This function can't be used at the same time with "Drag mode", when AO is active the blue bars as seen in the picture will be shown.

<img width="475" height="689" alt="image" src="https://github.com/user-attachments/assets/cd57aec4-8ddf-4f09-ae64-b59b66377bdf" />


Search and Filter: Searches for the written entity in the text box, or filters the search for Solid, Point and Base classes.

<img width="505" height="317" alt="image" src="https://github.com/user-attachments/assets/737fa831-31a6-48d5-b48b-24d196e6133d" />

Add Property: Adds a new property to the selected entity... the next picture shows an example.

<img width="591" height="528" alt="image" src="https://github.com/user-attachments/assets/b6ea8bb0-9146-4c8b-b349-0ebce66b563e" />

Copy to Clipboard: Clipboard copies all the FGD content written and edited so far by the user. (one of the output methods)

<img width="635" height="725" alt="image" src="https://github.com/user-attachments/assets/9528a37c-d0f1-469f-8a39-6ca814f700c5" />

The next 5 buttons that are outside the core vision:

<img width="782" height="104" alt="image" src="https://github.com/user-attachments/assets/962bfedb-10aa-40d2-90ca-dcaf196d227b" />

Import FGD: Self-Explanatory (File browser)
Export FGD: Exports or saves user current work in a file (File browser for adding a name)

Reset: As in the FGDParser, cleans the whole script for the functions to be usable again.

Drag Mode (OFF/ON): This activate in the entity list a drag mode to move up and down entities and these changes will be reflected in the Parser and the FGD file when exported. This function can't be used with Alphabetical Order. (When active the blue bar will be shown)

<img width="470" height="836" alt="image" src="https://github.com/user-attachments/assets/d484519d-ba8f-4588-8306-24cf16236851" />


<img width="467" height="755" alt="image" src="https://github.com/user-attachments/assets/2ed1d463-38c4-4225-87d9-1d7ca41de269" />


Toggle Light/Dark Mode: Will setup the Light/Dark mode... should be saved in the browser when revisiting the script.

### Notes

This script has some quirks and it's not a perfect editor in all the means, several notes should be taken into account:
- Some properties may have a mishap showing or directly being edited in the editor, this is a small percentage but still.
- Comments are deleted when exporting the PDF due to a possible error, coding the parser is complicated... This may be patched in the future.
- The script does understand when there are custom properties within a script, while recognized they can't be added for now.
- Search Function and Filter by don't work together, but they work independently when looking for an specific function or just showing the type of entities the user is looking for.

This script is mean't help modders and developers to setup and modify existing FGD files, the tool (website) isn't at it's prime.

Hoping future modifications solve and ease the matter.


# Credits
- Chuma (programming, team lead, full-stack)
- Nepta (programming, advice, backend)
- Dany (Testing and Feedback, frontend programming advice)


Special thanks to bmFbr, Paril, CommonCold, Lavender.

Special thanks to Watisdeze and Xage for giving me feedback and finding bugs.

Special thanks to:
- Quake Mapping Community (QBSP).
- Pacifist Paradise Community.
- Quakedev Community
All of our family and friends that support us.

Documentation written by Chuma in a formal/semi-formal way while keeping the style.

Personal thanks from me (Chuma) to all my family and friends that support me.
Shine with style!




