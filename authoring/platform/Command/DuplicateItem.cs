using System;
using Sitecore.Configuration;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Globalization;
using Sitecore.Web.UI.Sheer;

namespace Support.Foundation.SitecoreExtensions.Pipelines.DuplicateItem
{
    /// <summary>
    /// Uses the language-independent Item.Name, rather than Item.DisplayName,
    /// when building the default name shown by the SXA Duplicate Item dialog.
    /// </summary>
    public class DuplicateItem : Sitecore.XA.Foundation.ContentValidation.Pipelines.DuplicateItem.DuplicateItem
    {
        public new void GetName(ClientPipelineArgs args)
        {
            Assert.ArgumentNotNull(args, nameof(args));

            var databaseName = args.Parameters["database"];
            var database = Factory.GetDatabase(databaseName);
            Assert.IsNotNull(database, databaseName);

            Item item = database.GetItem(args.Parameters["id"]);
            if (item == null)
            {
                SheerResponse.Alert("Item not found.", Array.Empty<string>());
                args.AbortPipeline();
                return;
            }

            if (item.Parent == null)
            {
                SheerResponse.Alert("Cannot duplicate the root item.", Array.Empty<string>());
                args.AbortPipeline();
                return;
            }

            if (item.RuntimeSettings.IsVirtual && !item.Parent.RuntimeSettings.IsVirtual)
            {
                args.Parameters["name"] = item.Name;
                Context.ClientPage.ClientResponse.ClosePopups(true);
                return;
            }

            if (!args.IsPostBack)
            {
                SheerResponse.Input(
                    Translate.Text("Enter a new name for the page:"),
                    GetCopyOfName(item.Parent, item.Name),
                    Settings.ItemNameValidation,
                    Translate.Text("'$Input' is not a valid name."),
                    Settings.MaxItemNameLength);

                args.WaitForPostBack();
                return;
            }

            if (!args.HasResult)
            {
                args.AbortPipeline();
                return;
            }

            string result = args.Result;
            if (item.TemplateID == Sitecore.TemplateIDs.Language && !IsValidLanguage(result))
            {
                SheerResponse.Input(
                    Translate.Text("Enter a new name for the page:"),
                    result,
                    Settings.ItemNameValidation,
                    Translate.Text("'$Input' is not a valid name."),
                    Settings.MaxItemNameLength);

                args.WaitForPostBack();
                return;
            }

            args.Parameters["name"] = result;
        }
    }
}
