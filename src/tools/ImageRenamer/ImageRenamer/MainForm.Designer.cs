
namespace ImageRenamer
{
    partial class MainForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.PreviewPictureBox = new System.Windows.Forms.PictureBox();
            this.StartButton = new System.Windows.Forms.Button();
            this.DirectoryTextbox = new System.Windows.Forms.TextBox();
            this.SearchButton = new System.Windows.Forms.Button();
            this.RenameButton = new System.Windows.Forms.Button();
            this.NameTextbox = new System.Windows.Forms.TextBox();
            this.AutoSkipShortNamesCheckbox = new System.Windows.Forms.CheckBox();
            this.CreatureTypesList = new System.Windows.Forms.ListBox();
            this.SearchTypesTextbox = new System.Windows.Forms.TextBox();
            ((System.ComponentModel.ISupportInitialize)(this.PreviewPictureBox)).BeginInit();
            this.SuspendLayout();
            // 
            // PreviewPictureBox
            // 
            this.PreviewPictureBox.Location = new System.Drawing.Point(269, 12);
            this.PreviewPictureBox.Name = "PreviewPictureBox";
            this.PreviewPictureBox.Size = new System.Drawing.Size(612, 344);
            this.PreviewPictureBox.SizeMode = System.Windows.Forms.PictureBoxSizeMode.CenterImage;
            this.PreviewPictureBox.TabIndex = 0;
            this.PreviewPictureBox.TabStop = false;
            // 
            // StartButton
            // 
            this.StartButton.Location = new System.Drawing.Point(806, 364);
            this.StartButton.Name = "StartButton";
            this.StartButton.Size = new System.Drawing.Size(75, 23);
            this.StartButton.TabIndex = 1;
            this.StartButton.Text = "Start";
            this.StartButton.UseVisualStyleBackColor = true;
            this.StartButton.Click += new System.EventHandler(this.StartButton_Click);
            // 
            // DirectoryTextbox
            // 
            this.DirectoryTextbox.Location = new System.Drawing.Point(269, 365);
            this.DirectoryTextbox.Name = "DirectoryTextbox";
            this.DirectoryTextbox.Size = new System.Drawing.Size(495, 20);
            this.DirectoryTextbox.TabIndex = 2;
            this.DirectoryTextbox.Text = "D:\\User Data\\Workspace\\discord-autolink-bot\\src\\assets\\img\\cards\\creature";
            // 
            // SearchButton
            // 
            this.SearchButton.Location = new System.Drawing.Point(770, 364);
            this.SearchButton.Name = "SearchButton";
            this.SearchButton.Size = new System.Drawing.Size(30, 23);
            this.SearchButton.TabIndex = 3;
            this.SearchButton.Text = "...";
            this.SearchButton.UseVisualStyleBackColor = true;
            this.SearchButton.Click += new System.EventHandler(this.SearchButton_Click);
            // 
            // RenameButton
            // 
            this.RenameButton.Location = new System.Drawing.Point(709, 448);
            this.RenameButton.Name = "RenameButton";
            this.RenameButton.Size = new System.Drawing.Size(172, 26);
            this.RenameButton.TabIndex = 4;
            this.RenameButton.Text = "Rename and Next ->";
            this.RenameButton.UseVisualStyleBackColor = true;
            this.RenameButton.Click += new System.EventHandler(this.RenameButton_Click);
            // 
            // NameTextbox
            // 
            this.NameTextbox.Font = new System.Drawing.Font("Microsoft Sans Serif", 12F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.NameTextbox.Location = new System.Drawing.Point(269, 447);
            this.NameTextbox.Name = "NameTextbox";
            this.NameTextbox.Size = new System.Drawing.Size(434, 26);
            this.NameTextbox.TabIndex = 5;
            // 
            // AutoSkipShortNamesCheckbox
            // 
            this.AutoSkipShortNamesCheckbox.AutoSize = true;
            this.AutoSkipShortNamesCheckbox.Checked = true;
            this.AutoSkipShortNamesCheckbox.CheckState = System.Windows.Forms.CheckState.Checked;
            this.AutoSkipShortNamesCheckbox.Location = new System.Drawing.Point(269, 424);
            this.AutoSkipShortNamesCheckbox.Name = "AutoSkipShortNamesCheckbox";
            this.AutoSkipShortNamesCheckbox.Size = new System.Drawing.Size(212, 17);
            this.AutoSkipShortNamesCheckbox.TabIndex = 6;
            this.AutoSkipShortNamesCheckbox.Text = "Auto-skip short file names (Length < 12)";
            this.AutoSkipShortNamesCheckbox.UseVisualStyleBackColor = true;
            // 
            // CreatureTypesList
            // 
            this.CreatureTypesList.FormattingEnabled = true;
            this.CreatureTypesList.Items.AddRange(new object[] {
            "Advisor",
            "Aetherborn",
            "Ally",
            "Angel",
            "Antelope",
            "Ape",
            "Archer",
            "Archon",
            "Army",
            "Artificer",
            "Assassin",
            "Assembly-Worker",
            "Atog",
            "Aurochs",
            "Avatar",
            "Azra",
            "Badger",
            "Barbarian",
            "Basilisk",
            "Bat",
            "Bear",
            "Beast",
            "Beeble",
            "Berserker",
            "Bird",
            "Blinkmoth",
            "Boar",
            "Bringer",
            "Brushwagg",
            "Camarid",
            "Camel",
            "Caribou",
            "Carrier",
            "Cat",
            "Centaur",
            "Cephalid",
            "Chimera",
            "Citizen",
            "Cleric",
            "Cockatrice",
            "Construct",
            "Coward",
            "Crab",
            "Crocodile",
            "Cyclops",
            "Dauthi",
            "Demigod",
            "Demon",
            "Deserter",
            "Devil",
            "Dinosaur",
            "Djinn",
            "Dog",
            "Dragon",
            "Drake",
            "Dreadnought",
            "Drone",
            "Druid",
            "Dryad",
            "Dwarf",
            "Efreet",
            "Egg",
            "Elder",
            "Eldrazi",
            "Elemental",
            "Elephant",
            "Elf",
            "Elk",
            "Eye",
            "Faerie",
            "Ferret",
            "Fish",
            "Flagbearer",
            "Fox",
            "Frog",
            "Fungus",
            "Gargoyle",
            "Germ",
            "Giant",
            "Gnome",
            "Goat",
            "Goblin",
            "God",
            "Golem",
            "Gorgon",
            "Graveborn",
            "Gremlin",
            "Griffin",
            "Hag",
            "Harpy",
            "Hellion",
            "Hippo",
            "Hippogriff",
            "Homarid",
            "Homunculus",
            "Horror",
            "Horse",
            "Human",
            "Hydra",
            "Hyena",
            "Illusion",
            "Imp",
            "Incarnation",
            "Insect",
            "Jackal",
            "Jellyfish",
            "Juggernaut",
            "Kavu",
            "Kirin",
            "Kithkin",
            "Knight",
            "Kobold",
            "Kor",
            "Kraken",
            "Lamia",
            "Lammasu",
            "Leech",
            "Leviathan",
            "Lhurgoyf",
            "Licid",
            "Lizard",
            "Manticore",
            "Masticore",
            "Mercenary",
            "Merfolk",
            "Metathran",
            "Minion",
            "Minotaur",
            "Mole",
            "Monger",
            "Mongoose",
            "Monk",
            "Monkey",
            "Moonfolk",
            "Mouse",
            "Mutant",
            "Myr",
            "Mystic",
            "Naga",
            "Nautilus",
            "Nephilim",
            "Nightmare",
            "Nightstalker",
            "Ninja",
            "Noble",
            "Noggle",
            "Nomad",
            "Nymph",
            "Octopus",
            "Ogre",
            "Ooze",
            "Orb",
            "Orc",
            "Orgg",
            "Otter",
            "Ouphe",
            "Ox",
            "Oyster",
            "Pangolin",
            "Peasant",
            "Pegasus",
            "Pentavite",
            "Pest",
            "Phelddagrif",
            "Phoenix",
            "Phyrexian",
            "Pilot",
            "Pincher",
            "Pirate",
            "Plant",
            "Praetor",
            "Prism",
            "Processor",
            "Rabbit",
            "Rat",
            "Rebel",
            "Reflection",
            "Rhino",
            "Rigger",
            "Rogue",
            "Sable",
            "Salamander",
            "Samurai",
            "Sand",
            "Saproling",
            "Satyr",
            "Scarecrow",
            "Scion",
            "Scorpion",
            "Scout",
            "Sculpture",
            "Serf",
            "Serpent",
            "Servo",
            "Shade",
            "Shaman",
            "Shapeshifter",
            "Shark",
            "Sheep",
            "Siren",
            "Skeleton",
            "Slith",
            "Sliver",
            "Slug",
            "Snake",
            "Soldier",
            "Soltari",
            "Spawn",
            "Specter",
            "Spellshaper",
            "Sphinx",
            "Spider",
            "Spike",
            "Spirit",
            "Splinter",
            "Sponge",
            "Squid",
            "Squirrel",
            "Starfish",
            "Surrakar",
            "Survivor",
            "Tentacle",
            "Tetravite",
            "Thalakos",
            "Thopter",
            "Thrull",
            "Treefolk",
            "Trilobite",
            "Triskelavite",
            "Troll",
            "Turtle",
            "Unicorn",
            "Vampire",
            "Vedalken",
            "Viashino",
            "Volver",
            "Wall",
            "Warlock",
            "Warrior",
            "Weird",
            "Werewolf",
            "Whale",
            "Wizard",
            "Wolf",
            "Wolverine",
            "Wombat",
            "Worm",
            "Wraith",
            "Wurm",
            "Yeti",
            "Zombie",
            "Zubera"});
            this.CreatureTypesList.Location = new System.Drawing.Point(12, 12);
            this.CreatureTypesList.Name = "CreatureTypesList";
            this.CreatureTypesList.Size = new System.Drawing.Size(243, 433);
            this.CreatureTypesList.TabIndex = 7;
            this.CreatureTypesList.DoubleClick += new System.EventHandler(this.CreatureTypesList_DoubleClick);
            // 
            // SearchTypesTextbox
            // 
            this.SearchTypesTextbox.Location = new System.Drawing.Point(12, 452);
            this.SearchTypesTextbox.Name = "SearchTypesTextbox";
            this.SearchTypesTextbox.Size = new System.Drawing.Size(243, 20);
            this.SearchTypesTextbox.TabIndex = 8;
            this.SearchTypesTextbox.TextChanged += new System.EventHandler(this.SearchTypesTextbox_TextChanged);
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(893, 484);
            this.Controls.Add(this.SearchTypesTextbox);
            this.Controls.Add(this.CreatureTypesList);
            this.Controls.Add(this.AutoSkipShortNamesCheckbox);
            this.Controls.Add(this.NameTextbox);
            this.Controls.Add(this.RenameButton);
            this.Controls.Add(this.SearchButton);
            this.Controls.Add(this.DirectoryTextbox);
            this.Controls.Add(this.StartButton);
            this.Controls.Add(this.PreviewPictureBox);
            this.Name = "MainForm";
            this.Text = "Image Renamer";
            ((System.ComponentModel.ISupportInitialize)(this.PreviewPictureBox)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.PictureBox PreviewPictureBox;
        private System.Windows.Forms.Button StartButton;
        private System.Windows.Forms.TextBox DirectoryTextbox;
        private System.Windows.Forms.Button SearchButton;
        private System.Windows.Forms.Button RenameButton;
        private System.Windows.Forms.TextBox NameTextbox;
        private System.Windows.Forms.CheckBox AutoSkipShortNamesCheckbox;
        private System.Windows.Forms.ListBox CreatureTypesList;
        private System.Windows.Forms.TextBox SearchTypesTextbox;
    }
}

