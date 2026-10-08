using System;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Events;

namespace MyProject.Foundation.Events
{
    public class ClearValidToOnItemSaving
    {
        public void OnItemSaving(object sender, EventArgs args)
        {
            var item = Event.ExtractParameter<Item>(args, 0);

            if (item == null)
            {
                return;
            }

            if (!string.Equals(
                item.Database?.Name,
                "master",
                StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            var validToField = item.Fields["__Valid to"];

            if (validToField == null ||
                string.IsNullOrEmpty(validToField.Value))
            {
                return;
            }

            validToField.Value = string.Empty;

            Log.Info(
                $"Cleared __Valid to before saving. Item: {item.ID}",
                this);
        }
    }
}