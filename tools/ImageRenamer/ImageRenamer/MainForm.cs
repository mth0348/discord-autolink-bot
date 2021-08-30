using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Windows.Forms;

namespace ImageRenamer
{
    public partial class MainForm : Form
    {
        private string[] filenamesLoaded;
        private int currentFile = -1;

        private List<string> originalTypeList;

        private bool hasReplaced = false;

        public MainForm()
        {
            InitializeComponent();

            RenameButton.Enabled = false;

            originalTypeList = CreatureTypesList.Items.Cast<String>().ToList();
        }

        private void SearchButton_Click(object sender, EventArgs e)
        {
            using (var fileBrowserDialog = new FolderBrowserDialog())
            {
                DialogResult result = fileBrowserDialog.ShowDialog();

                if (result == DialogResult.OK && !string.IsNullOrWhiteSpace(fileBrowserDialog.SelectedPath))
                {
                    DirectoryTextbox.Text = fileBrowserDialog.SelectedPath;
                }
            }
        }

        private void StartButton_Click(object sender, EventArgs e)
        {
            filenamesLoaded = Directory.GetFiles(DirectoryTextbox.Text);
            RenameButton.Enabled = true;

            SetNextFile();
        }

        private void SetNextFile()
        {
            currentFile++;
            hasReplaced = false;

            if (filenamesLoaded.Length > currentFile)
            {
                var nextFile = filenamesLoaded[currentFile];

                // decide if auto-skip.
                if (AutoSkipShortNamesCheckbox.Checked && nextFile.Length < 12)
                {
                    SetNextFile();
                    return;
                }

                // load preview image without locking file.
                using (var bmpTemp = new Bitmap(nextFile))
                {
                    PreviewPictureBox.Image = new Bitmap(bmpTemp);
                    PreviewPictureBox.Update();
                }

                // prompt to rename.
                NameTextbox.Text = Path.GetFileNameWithoutExtension(nextFile);
                NameTextbox.Focus();
                NameTextbox.SelectAll();
            }
            else
            {
                MessageBox.Show("All files checked.");

                NameTextbox.Text = string.Empty;
                RenameButton.Enabled = false;
            }
        }

        private void RenameButton_Click(object sender, EventArgs e)
        {
            var oldPath = filenamesLoaded[currentFile];
            var newPath = Path.Combine(Path.GetDirectoryName(oldPath), Guid.NewGuid().ToString().Substring(24) + "_" + NameTextbox.Text + Path.GetExtension(oldPath));

            // unload image.
            PreviewPictureBox.Image.Dispose();
            PreviewPictureBox.Image = null;
            PreviewPictureBox.Update();

            File.Move(oldPath, newPath);

            SetNextFile();
        }

        private void CreatureTypesList_DoubleClick(object sender, EventArgs e)
        {
            if (hasReplaced)
            {
                NameTextbox.Text += " " + CreatureTypesList.SelectedItem.ToString();
            }
            else
            {
                NameTextbox.Text = CreatureTypesList.SelectedItem.ToString();
                hasReplaced = true;
            }
        }

        private void SearchTypesTextbox_TextChanged(object sender, EventArgs e)
        {
            var filteredItems = originalTypeList.Where(i => i.ToLower().Contains(SearchTypesTextbox.Text.ToLower())).ToArray();
            CreatureTypesList.Items.Clear();
            CreatureTypesList.Items.AddRange(filteredItems);
        }
    }
}